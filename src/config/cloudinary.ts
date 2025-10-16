import { v2 as cloudinary } from 'cloudinary'
import { envs } from './envs'

cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET,
  secure: true,
})

export const uploadImage = async (imagePath: string) => {
  try {
    const options = {
      folder: 'node-veterinario',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    }

    const result = await cloudinary.uploader.upload(imagePath, options)
    console.log('✅ Imagen subida:', result.secure_url)

    // ✅ Devuelve el objeto completo, no solo public_id
    return {
      public_id: result.public_id,
      secure_url: result.secure_url, // Esta es la URL correcta
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('❌ Error al subir imagen:', error)
    throw error
  }
}

export const deleteImageFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log('🗑️ Resultado eliminación:', result)

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Error al eliminar: ${result.result}`)
    }
  } catch (error) {
    console.error('❌ Error eliminando de Cloudinary:', error)
    throw error
  }
}
