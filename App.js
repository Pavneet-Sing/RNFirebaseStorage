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
    Platform,
    SafeAreaView,
    Text,
} from "react-native";
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-picker';
export default class App extends React.Component {

    state = {
        imagePath: require("./img/default.jpg"),
        isLoading: false,
        status: '',
    }

    chooseFile = () => {
        this.setState({ status: '' });
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
            if (response.didCancel) {
                console.log('User cancelled image picker', storage());
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
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
        let task = reference.putFile(path);
        task.then(() => {
            console.log('Image uploaded to the bucket!');
            this.setState({ isLoading: false, status: 'Image uploaded successfully' });
        }).catch((e) => {
            status = 'Something went wrong';
            console.log('uploading image error => ', e);
            this.setState({ isLoading: false, status: 'Something went wrong' });
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

    getPlatformURI(imagePath){
        let imgSource = imagePath;
        if (isNaN(imagePath)) {
            imgSource = { uri: this.state.imagePath };
            if (Platform.OS == 'android') {
                imgSource.uri = "file:///"+imgSource.uri;
            }
        }
        return imgSource
    }

    render() {
        let { imagePath } = this.state;
        let imgSource = this.getPlatformURI(imagePath)
        return (
            <SafeAreaView style={styles.container}>
                {
                    this.state.isLoading && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
                {/* <ActivityIndicator size="large" style={styles.loadingIndicator} /> */}
                <View style={styles.imgContainer}>
                    <Text style={styles.boldTextStyle}>{this.state.status}</Text>
                    <Image style={styles.uploadImage} source={imgSource} />
                    <View style={styles.eightyWidthStyle} >
                        <Button title={'Upload Image'} onPress={this.chooseFile}></Button>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#e6e6fa',
    },
    imgContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    eightyWidthStyle: {
        width: '80%',
        margin: 2,
    },
    uploadImage: {
        width: '80%',
        height: 300,
    },
    loadingIndicator: {
        zIndex: 5,
        width: '100%',
        height: '100%',
    },
    boldTextStyle: {
        fontWeight: 'bold',
        fontSize: 22,
        color: '#5EB0E5',
    }

});