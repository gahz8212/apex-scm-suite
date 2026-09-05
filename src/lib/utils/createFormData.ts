import { resize } from "./resize";
export const imageInsert = async (e: any, imageList: { url: string }[]) => {
  const imageArray = e.target.files;
  const formData = new FormData();
  const notConflictImages = [];
  // console.log(imageArray)

    const ableCount = 3 - imageList.length;
    if (ableCount > 0) {
      if (imageList.length > 0) {
      for (let image of imageArray) {
        let isConflict = false;
        for (let i = 0; i < imageList.length; i++) {
          if (imageList[i].url.slice(5) === image.name) {
            isConflict = true;
            break;
          }
        }
        if (!isConflict) {
          notConflictImages.push(image);
        }
      }
      for (
        let i = 0;
        i <
        (notConflictImages.length > ableCount
          ? ableCount
          : notConflictImages.length);
          i++
          ) {
            formData.append("images", await resize(notConflictImages[i]));
      }
    } else {
      for (
        let i = 0;
        i < (imageArray.length > ableCount ? ableCount : imageArray.length);
        i++
        ) {
          formData.append("images", await resize(imageArray[i]));
        }
      }
    }
    return formData;
  
  };