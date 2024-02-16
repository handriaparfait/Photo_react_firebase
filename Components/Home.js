import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet, FlatList } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { addDoc, collection, onSnapshot  } from '@react-native-firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@react-native-firebase/storage';
import { storage, db } from '../firebaseConfig';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'images'), (snapshot) => {
      const imageList = [];
      snapshot.forEach((doc) => {
        imageList.push({ id: doc.id, ...doc.data() });
      });
      setImages(imageList);
    });

    return () => unsubscribe();
  }, []);

  const deleteSelectedImages = async () => {
    try {
        const deletionPromises = selectedImages.map(async (imageId) => {
            const imageRef = ref(storage, `images/${imageId}`);
            deleteObject(imageRef).catch((error) => {
                console.log("Failed to delete image: ", error);
            });
            const imageDocRef = collection(db, 'images').doc(imageId);
            await imageDocRef.delete(); 
        });

        await Promise.all(deletionPromises);

        setSelectedImages([]);
    } catch (error) {
        console.error('Erreur lors de la suppression d\'image :', error);
    }
    return;
};

  async function ajouter() {
    if (!selectedImage) {
      console.log('Aucune image sélectionnée.');
      return;
    }

    try {
      // Créer une référence unique pour le fichier dans le stockage
      const storageRef = ref(storage, `images/${Date.now()}`);

      // Convertir l'URI de l'image en blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      // Uploader le blob vers Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, blob);
      await uploadTask;

      // Récupérer l'URL de téléchargement de l'image
      const downloadURL = await getDownloadURL(storageRef);

      // Ajouter l'URL de téléchargement dans Firestore
      const imagesCollectionRef = collection(db, 'images');
      const docRef = await addDoc(imagesCollectionRef, { downloadURL });

      setModalVisible(false); // Fermer la fenêtre modale après l'ajout
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
    }
  }

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      cropping: true,
      aspect: [3, 4],
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        setSelectedImage(imageUri);
        setModalVisible(true);
      }
    });
  };

  const toggleImageSelection = (imageId) => {
    const isSelected = selectedImages.includes(imageId);

    if (isSelected) {
      setSelectedImages(selectedImages.filter((id) => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  


  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, position: 'absolute', top: 50 }}>
      <Text>Car List</Text>

      <View style={{ height: 600, width: '100%' }}>
        <FlatList
          data={images}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleImageSelection(item.id)}
              onLongPress={() => setModalVisible(true)}
            >
              <Image
                key={item.id}
                source={{ uri: item.downloadURL }}
                style={{
                  width: 100,
                  height: 100,
                  margin: 5,
                  opacity: selectedImages.includes(item.id) ? 0.7 : 1,
                }}
                resizeMode="cover"
              />
              {selectedImages.includes(item.id) && (
                <View style={styles.overlay}>
                  <Text style={{ color: 'white' }}>Sélectionné</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={{ marginTop: 20 }}
        />
      </View>

      <TouchableOpacity
        onPress={openImagePicker}
        style={{
          position: 'relative',
          width: 44,
          height: 44,
          bottom: 0,
          marginRight: -300,
          backgroundColor: 'black',
          borderRadius: 25,
          justifyContent: 'center',
          flex: 1,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 24 }}>+</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={{ color: 'white', fontSize: 24 }}>x</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={ajouter}
            style={styles.add}
          >
            <Text style={{ color: 'white', fontSize: 20 }}>Add</Text>
          </TouchableOpacity>

        </View>

      </Modal>
      <TouchableOpacity onPress={deleteSelectedImages} style={styles.delete}>
        <Text style={{ color: 'white', fontSize: 15 }}>del selected</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalImage: {
    width: '80%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: 'black',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  add: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: 'black',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  delete: {
    position: 'relative',
    bottom: 42,
    left: -120,
    width: 90,
    height: 44,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius : 5,
  },
});
