import Constants from "expo-constants";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";

export const compressImage = async(uri:string)=>{
    try {
        const result = await ImageManipulator.manipulateAsync(uri, [{resize:{width:800}}], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });
        return result;
    } catch (error) {
        console.error("Error compressing image:", error);
        throw error;
    }
}

export const compressVideo = async(uri:string)=>{
    if (Platform.OS === "web" || Constants.appOwnership === "expo") {
        return uri;
    }

    try {
        const { Video } = await import("react-native-compressor");
        const compressed: string = await Video.compress(uri, {
            compressionMethod: "auto",
        });
        return compressed;
    } catch (error) {
        console.warn("Video compression unavailable, using original video URI:", error);
        return uri;
    }
}
