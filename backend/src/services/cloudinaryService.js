const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (fileInput) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME || 
    process.env.CLOUDINARY_CLOUD_NAME === "demo" || 
    !process.env.CLOUDINARY_API_KEY || 
    process.env.CLOUDINARY_API_KEY === "demo_key"
  ) {
    console.log("Cloudinary running in sandbox mock mode - returning mock PDF attachment URL");
    return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  }

  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(fileInput)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "smartcare-hospital", resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(fileInput);
    } else {
      cloudinary.uploader.upload(
        fileInput,
        { folder: "smartcare-hospital", resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
    }
  });
};

module.exports = { uploadImage };
