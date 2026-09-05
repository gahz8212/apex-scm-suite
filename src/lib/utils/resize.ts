import imageCompression from "browser-image-compression";
export const resize = async (file: File) => {
  // console.log("fitst_file", file);
  const newFile = await handleNewFileFrom(file);
  return newFile;

  //Blob형식을 File형식으로 변환 _ handleNewUrlFrom
  // const newUrl = await handleNewUrlFrom(newFile);
  // return { file: newFile, id: newFile?.lastModified, url: newUrl };
};
const handleNewFileFrom = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
  };
  const compressed = await imageCompression(file, options);
  // return compressed;
  const resultFile = new File([compressed], compressed.name, {
    type: compressed.type,
  });
  return resultFile;
};

export const handleNewUrlFrom = async (file: File) => {
  try {
    const url = await imageCompression.getDataUrlFromFile(file);
    return url;
  } catch (e) {
    console.error(e);
  }
};