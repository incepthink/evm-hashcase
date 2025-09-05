"use server";

const axios = require("axios");
const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
// console.log(jwt);

// Uploads the NFT metadata
export const uploadJsonToIPFS = async (jsonBody: {}) => {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  try {
    const res = await axios.post(url, jsonBody, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
      hash: res.data.IpfsHash,
    };
  } catch (error: any) {
    console.error(error, "File upload problem");
    return {
      success: false,
      message: error.message,
    };
  }
};

export const uploadFileToIPFS = async (data: any) => {
  const pinataMetadata = JSON.stringify({
    // COME BACK LATER
    name: data?.get("file")?.name,
  });
  data.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", pinataOptions);

  // console.log(data, "my data");

  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  try {
    const res = await axios.post(url, data, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        Authorization: `Bearer ${jwt}`,
      },
    });

    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
      hash: res.data.IpfsHash,
    };
  } catch (error: any) {
    console.error(error, "File upload problem");
    return {
      success: false,
      message: error.message,
    };
  }
};
