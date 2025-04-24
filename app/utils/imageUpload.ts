import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";

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

      // Add a cache-busting timestamp query parameter to the URL
      const timestamp = Date.now();
      return {
        url: `${(supabase as any).supabaseUrl}/storage/v1/object/public/avatars/${data.path}?t=${timestamp}`,
      };
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

      // Add a cache-busting timestamp query parameter to the URL
      const timestamp = Date.now();
      return {
        url: `${(supabase as any).supabaseUrl}/storage/v1/object/public/avatars/${data.path}?t=${timestamp}`,
      };
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
 * Gets a cache-busting URL for an avatar
 * This is useful to force the UI to refresh the image after updates
 */
export const getAvatarUrlWithCacheBusting = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  
  // Add a timestamp to bust the cache
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

// Define the default export
const imageUploadUtils = {
  bucketExists,
  ensureAvatarsBucketExists,
  requestMediaPermissions,
  pickImage,
  uploadProfileImage,
  removeProfileImage,
  getAvatarUrlWithCacheBusting
};

export default imageUploadUtils; 