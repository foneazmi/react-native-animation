import * as React from 'react';
import {
  StatusBar,
  FlatList,
  Image,
  Animated,
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Easing,
  SafeAreaViewBase,
  SafeAreaView,
} from 'react-native';
const {width, height} = Dimensions.get('screen');

const API_KEY = '563492ad6f9170000100000149311559039f4d3a8fa4fc48fadade6c';
const API_URL =
  'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20';

const IMAGE_SIZE = 80;

const fetchImageFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      Authorization: API_KEY,
    },
  });
  const {photos} = await data.json();
  return photos;
};

export default () => {
  const [images, setImages] = React.useState(null);
  React.useEffect(() => {
    const fetchImage = async () => {
      const rawImages = await fetchImageFromPexels();
      setImages(rawImages);
    };
    fetchImage();
  }, []);

  const topRef = React.useRef();
  const thumbRef = React.useRef();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index);
    topRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });
    if (index * (IMAGE_SIZE + 10) - IMAGE_SIZE / 2 > width / 2) {
      thumbRef?.current?.scrollToOffset({
        offset: index * (IMAGE_SIZE + 10) - width / 2 + IMAGE_SIZE / 2,
        animated: true,
      });
    } else {
      thumbRef?.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  if (!images) {
    return <Text>Loading.....</Text>;
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <FlatList
        ref={topRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(ev) => {
          console.log(ev.nativeEvent.contentOffset.x / width - 0.5);
          scrollToActiveIndex(
            Math.ceil(ev.nativeEvent.contentOffset.x / width - 0.5),
          );
        }}
        keyExtractor={(_, index) => `${index}-images`}
        renderItem={({item}) => {
          return (
            <View style={{width, height}}>
              <Image
                source={{uri: item.src.portrait}}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          );
        }}
      />
      <FlatList
        ref={thumbRef}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `${index}-images-2`}
        style={{position: 'absolute', bottom: IMAGE_SIZE}}
        contentContainerStyle={{marginHorizontal: 10}}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
              <Image
                source={{uri: item.src.portrait}}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 10,
                  marginRight: 10,
                  borderWidth: 2,
                  borderColor: index === activeIndex ? '#fff' : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </>
  );
};
