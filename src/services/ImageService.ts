import { supabase } from '../../supabaseClient';

const BACKUP_BUCKET_NAME = 'car-studio-backups';

export const ImageService = {
  /**
   * Updates the vehicle record in the cache to use the new Car Studio images.
   * @param vehicleId - The WordPress ID of the vehicle.
   * @param featureImageUrl - The new primary image URL from Car Studio.
   * @param galleryImageUrls - An array of new gallery image URLs from Car Studio.
   */
  async saveCarStudioImagesToVehicle(
    vehicleId: number,
    featureImageUrl: string,
    galleryImageUrls: string[]
  ) {
    const { error } = await supabase
      .from('vehicles_cache')
      .update({
        car_studio_feature_image: featureImageUrl,
        car_studio_gallery: galleryImageUrls,
        use_car_studio_images: true,
        last_synced_at: new Date().toISOString(), // Touch the record
      })
      .eq('id', vehicleId);

    if (error) {
      console.error('Error updating vehicle with Car Studio images:', error);
      throw new Error('No se pudo guardar las nuevas imágenes en el registro del vehículo.');
    }
  },

  /**
   * Fetches an image from a public URL and uploads it as a backup to Supabase Storage.
   * @param imageUrl - The public URL of the image to back up.
   * @param vehicleId - The ID of the vehicle this image belongs to.
   * @returns The path of the uploaded file in Supabase Storage.
   */
  async backupImageToSupabase(imageUrl: string, vehicleId: number): Promise<string> {
    try {
      // Fetch the image from the public URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
      }
      const imageBlob = await response.blob();
      
      // Create a unique file name
      const fileExtension = imageBlob.type.split('/')[1] || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const filePath = `${vehicleId}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(BACKUP_BUCKET_NAME)
        .upload(filePath, imageBlob);

      if (uploadError) {
        throw uploadError;
      }

      return data.path;
    } catch (error) {
      console.error(`Failed to back up image ${imageUrl}:`, error);
      // Don't throw an error that stops the whole process, just log it.
      // The primary goal is to save the URLs, backup is secondary.
      return ''; 
    }
  },

  /**
   * A comprehensive function to save Car Studio images and back them up.
   * @param vehicleId - The ID of the vehicle.
   * @param processedImages - An array of image URLs from Car Studio.
   */
  async processAndSaveImages(vehicleId: number, processedImages: string[]) {
    if (!processedImages || processedImages.length === 0) {
      throw new Error('No images to process.');
    }
    
    const featureImage = processedImages[0];
    const galleryImages = processedImages.slice(0); // Use all images for gallery including feature

    // Step 1: Save the URLs to the vehicle record. This is the most critical step.
    await this.saveCarStudioImagesToVehicle(vehicleId, featureImage, galleryImages);

    // Step 2: Asynchronously back up all images to Supabase Storage.
    // We don't wait for this to finish to give the user a faster response.
    // The Promise.all is for running backups in parallel.
    Promise.all(
        processedImages.map(url => this.backupImageToSupabase(url, vehicleId))
    ).then(paths => {
        console.log('Successfully backed up images to Supabase Storage:', paths.filter(p => p));
    }).catch(err => {
        console.error("An error occurred during the background image backup process:", err);
    });
  }
};
