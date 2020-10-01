/**
 * @author Pavneet Singh
 */

import React from "react";
import {
    StyleSheet,
    View,
    Button,
    Image,
    ActivityIndicator,
    Platform
} from "react-native";
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-picker';
export default class App extends React.Component {

    state = {
        imagePath: require("./img/default.jpg"),
        isLoading: false,
    }

    chooseFile = () => {
        var options = {
            title: 'Select Image',
            customButtons: [
                { name: 'customOptionKey', title: 'Choose Photo from Custom Option' },
            ],
            storageOptions: {
                skipBackup: true, // do not backup to iCloud
                path: 'images', // store camera images under Pictures/images for android and Documents/images for iOS
            },
        };
        ImagePicker.showImagePicker(options, response => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker', storage());
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                alert(response.customButton);
            } else {
                let sourceURI = response.uri;
                let path = this.getPlatformPath(response).value;
                let fileName = this.getFileName(response.fileName, path);
                this.setState({ imagePath: path });
                this.uploadImageToStorage(path, fileName);
            }
        });
    };

    getFileName(name, path) {
        if (name != null) { return name; }

        if (Platform.OS === "ios") {
            path = "~" + path.substring(path.indexOf("/Documents"));
        }
        return path.split("/").pop();
    }

    uploadImageToStorage(path, name) {
        this.setState({ isLoading: true });
        let reference = storage().ref(name);
        console.log(`Path is ${path} : ${reference}`);
        let task = reference.putFile(path);
        task.then(() => {
            console.log('Image uploaded to the bucket!');
            this.setState({ isLoading: false });
        }).catch((e) => {
            console.log('uploading image error => ', e);
            this.setState({ isLoading: false });
        });
    }

    /**
     * Get platform specific value from response
     */
    getPlatformPath({ path, uri }) {
        return Platform.select({
            android: { "value": path },
            ios: { "value": uri }
        })
    }

    render() {
        let { imagePath } = this.state;
        let imgSource = imagePath
        if (isNaN(path)) {
            imgSource = { uri: this.state.imagePath };
        }
        console.log(typeof this.state.imagePath);
        console.log(this.state.imagePath);
        return (
            <View>
                {this.state.isLoading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
                <View style={styles.container}>
                    <Image style={styles.uploadImage} source={imgSource} />
                    <View style={styles.eightyWidthStyle} >
                        <Button title={'Upload Image iOS'} onPress={this.chooseFile}></Button>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#e6e6fa',
        alignItems: 'center',
    },
    eightyWidthStyle: {
        width: '80%',
        margin: 2,
    },
    uploadImage: {
        resizeMode: 'contain',
        width: '80%',
        height: 300,
    },
    loadingIndicator: {
        width: '100%',
        height: '100%',
    }

});