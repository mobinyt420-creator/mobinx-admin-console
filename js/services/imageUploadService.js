// 100% Free Image Upload Service (No Credit Card / Zero Cost)
// Uploads images directly to free high-speed CDN and returns instant image URL

const FREE_IMGBB_API_KEY = "c18f8d9fa34522fb9282367d3e69622d"; // Public client free tier key

export async function uploadImageToFreeCdn(fileOrBase64) {
  try {
    let base64Data = '';

    if (typeof fileOrBase64 === 'string') {
      // If already base64 data URL
      base64Data = fileOrBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      // Read file to base64
      base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          resolve(result.replace(/^data:image\/[a-z]+;base64,/, ''));
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });
    }

    const formData = new FormData();
    formData.append('image', base64Data);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${FREE_IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data && data.data && data.data.url) {
      return data.data.url;
    } else {
      console.warn('Free CDN response notice, using direct data URL');
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : null;
    }
  } catch (error) {
    console.warn('Image upload fallback to data URL:', error.message);
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : null;
  }
}
