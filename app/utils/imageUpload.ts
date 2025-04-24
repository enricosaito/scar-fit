import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";
import { Image } from "expo-image";

// Cache timestamps to avoid excessive refreshing
const urlTimestamps = new Map<string, string>();

// Keep track of which images we've preloaded
const preloadedImages = new Set<string>();

/**
 * Checks if a bucket exists in Supabase storage
 */
export const bucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.some(bucket => bucket.name === bucketName) || false;
  } catch (error) {
    console.error(`Error checking if bucket ${bucketName} exists:`, error);
    return false;
  }
};

/**
 * Ensures that the avatars bucket exists in Supabase
 */
export const ensureAvatarsBucketExists = async (): Promise<void> => {
  try {
    // Check if bucket exists
    const exists = await bucketExists('avatars');
    
    // If it doesn't exist, create it
    if (!exists) {
      await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
      });
    }
  } catch (error) {
    console.error("Error ensuring avatars bucket exists:", error);
  }
};

/**
 * Requests camera and photo library permissions for image picking
 */
export const requestMediaPermissions = async (): Promise<boolean> => {
  try {
    // Request camera roll permissions
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== "granted") {
      console.error("Media library permission not granted");
      return false;
    }

    // Request camera permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") {
      console.error("Camera permission not granted");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error requesting permissions:", error);
    return false;
  }
};

/**
 * Picks an image from the device gallery or camera
 */
export const pickImage = async (useCamera = false): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const hasPermissions = await requestMediaPermissions();
    if (!hasPermissions) {
      return null;
    }

    // Use ImagePicker.MediaTypeOptions but ignore the deprecation warning for now
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

    if (result.canceled) {
      return null;
    }

    return result.assets[0];
  } catch (error) {
    console.error("Error picking image:", error);
    return null;
  }
};

/**
 * Gets a cache-busting URL for an avatar
 * This is useful to force the UI to refresh the image after updates
 * but also avoids excessive refreshing by reusing timestamps
 */
export function getAvatarUrlWithCacheBusting(url: string | null | undefined): string {
  // Return placeholder if URL is not available
  if (!url) return "https://i.imgur.com/p7ucIoQ.png";

  // Add cache busting parameter to ensure UI refresh after avatar update
  // Only update every hour to prevent excessive refreshing
  const cacheBuster = Math.floor(Date.now() / 3600000);
  return `${url}?cacheBust=${cacheBuster}`;
}

/**
 * Forces refresh of avatar URL by generating a new timestamp
 * Call this when you know the image has changed
 */
export function forceRefreshAvatarUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // Remove any existing query params
  const baseUrl = url.split('?')[0];
  
  // Generate a new timestamp
  const newTimestamp = Date.now().toString();
  urlTimestamps.set(baseUrl, newTimestamp);
  
  return `${baseUrl}?t=${newTimestamp}`;
}

/**
 * Clears the image cache to ensure all avatar instances are refreshed
 * This helps with updating avatars displayed in lists and headers
 */
export async function clearImageCache(): Promise<void> {
  try {
    // Clear the expo-image cache
    if (typeof Image !== 'undefined') {
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
    }
    
    console.log('Image cache cleared successfully');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
}

/**
 * Uploads an image to Supabase storage
 */
export const uploadProfileImage = async (
  userId: string,
  imageUri: string
): Promise<{ url: string } | null> => {
  try {
    // Ensure avatars bucket exists
    await ensureAvatarsBucketExists();

    // Create a unique file path for the image
    const fileExt = imageUri.substring(imageUri.lastIndexOf(".") + 1);
    const filePath = `${userId}/profile.${fileExt}`;

    // For web, we need to fetch the image first
    if (Platform.OS === "web") {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true });

      if (error) {
        throw error;
      }

      // Generate URL without cache busting (we'll add it when needed)
      const url = `${(supabase as any).supabaseUrl}/storage/v1/object/public/avatars/${data.path}`;
      
      // Force refresh this URL in our timestamp cache
      forceRefreshAvatarUrl(url);
      
      return { url };
    } 
    // For native platforms, we read as base64 and convert to ArrayBuffer
    else {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(base64), { 
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Generate URL without cache busting (we'll add it when needed)
      const url = `${(supabase as any).supabaseUrl}/storage/v1/object/public/avatars/${data.path}`;
      
      // Force refresh this URL in our timestamp cache
      forceRefreshAvatarUrl(url);
      
      return { url };
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return null;
  }
};

/**
 * Removes a user's profile image from Supabase storage
 */
export const removeProfileImage = async (userId: string): Promise<boolean> => {
  try {
    // Delete the file from Supabase storage (this will remove all files in the user's folder)
    const { error } = await supabase.storage
      .from("avatars")
      .remove([`${userId}/profile.png`, `${userId}/profile.jpg`, `${userId}/profile.jpeg`]);
    
    if (error) {
      console.error("Error removing profile image:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error removing profile image:", error);
    return false;
  }
};

/**
 * Preloads an avatar image to ensure it's available in the cache
 */
export const preloadAvatarImage = async (url?: string | null): Promise<void> => {
  if (!url) return;
  
  try {
    // Get a stable URL with cache busting
    const cacheBustingUrl = getAvatarUrlWithCacheBusting(url);
    
    // Ensure we have a valid URL before prefetching
    if (cacheBustingUrl) {
      // Preload the image with appropriate caching
      await Image.prefetch(cacheBustingUrl, {
        cachePolicy: 'memory-disk'
      });
      console.log('Avatar image preloaded');
    }
  } catch (error) {
    console.error('Error preloading avatar image:', error);
  }
};

/**
 * Preload multiple avatar images for better performance
 * @param urls Array of avatar URLs to preload
 */
export const batchPreloadAvatarImages = async (urls: (string | undefined | null)[]): Promise<void> => {
  if (!urls || urls.length === 0) return;
  
  try {
    // Filter out nulls, undefineds, and already preloaded images
    const validUrls = urls
      .filter((url): url is string => 
        typeof url === 'string' && !preloadedImages.has(url)
      )
      .map(url => {
        // Get a stable URL with cache busting
        const baseUrl = url.split('?')[0];
        preloadedImages.add(baseUrl);
        return getAvatarUrlWithCacheBusting(url);
      })
      .filter((url): url is string => typeof url === 'string');
    
    if (validUrls.length === 0) return;
    
    // Preload all images in parallel
    console.log(`Batch preloading ${validUrls.length} avatar images`);
    await Image.prefetch(validUrls, {
      cachePolicy: 'memory-disk'
    });
    
    console.log('Avatar images preloaded successfully');
  } catch (error) {
    console.error('Error batch preloading avatar images:', error);
  }
};

/**
 * Clears the image cache and forces a refresh of the avatar URL
 * Combines clearImageCache and forceRefreshAvatarUrl for convenience
 */
export async function forceClearAndRefreshAvatar(url: string | null | undefined): Promise<string | undefined> {
  try {
    // First clear the image cache
    await clearImageCache();
    
    // Then force refresh the URL
    return forceRefreshAvatarUrl(url);
  } catch (error) {
    console.error('Error clearing cache and refreshing avatar:', error);
    return undefined;
  }
}

// Define the default export
const imageUploadUtils = {
  bucketExists,
  ensureAvatarsBucketExists,
  requestMediaPermissions,
  pickImage,
  uploadProfileImage,
  removeProfileImage,
  getAvatarUrlWithCacheBusting,
  forceRefreshAvatarUrl,
  preloadAvatarImage,
  batchPreloadAvatarImages,
  clearImageCache,
  forceClearAndRefreshAvatar
};

export default imageUploadUtils; 