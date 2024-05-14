/* eslint-disable react-native/no-inline-styles */
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withClamp,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  Button,
  colors,
  FocusAwareStatusBar,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/ui';

function filterMongolianCyrillicAndPunctuation(input: string): string {
  // This regex matches any character that is NOT Mongolian Cyrillic, a dot, or a comma
  // and replaces it with an empty string, effectively removing it.
  // Includes the additional Mongolian Cyrillic characters Өө and Үү.
  const regex = /[^а-яА-ЯёЁөӨүҮ.,\s]+/g;
  return input.replace(regex, '');
}

export default function Feed() {
  const [counter, setCounter] = useState(0);
  const [recording, setRecording] = useState(false);

  function getDurationFormatted(milliseconds: number) {
    const minutes = milliseconds / 1000 / 60;
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
    return seconds < 10
      ? `${Math.floor(minutes)}:0${seconds}`
      : `${Math.floor(minutes)}:${seconds}`;
  }

  const animatedBorderRadius = useSharedValue<number>(112);
  const animatedHeight = useSharedValue<number>(40);
  const animatedWidth = useSharedValue<number>(40);

  const animatedStyles = useAnimatedStyle(() => ({
    borderRadius: withTiming(animatedBorderRadius.value),
    height: withSpring(animatedHeight.value),
    width: withSpring(animatedWidth.value),
  }));

  const start = () => {
    setRecording(true);
    setCounter(counter + 1);

    animatedBorderRadius.value -= 105;
    animatedHeight.value -= 15;
    animatedWidth.value -= 15;
  };

  const stop = () => {
    setRecording(false);
    animatedBorderRadius.value = 112;
    animatedHeight.value = 40;
    animatedWidth.value = 40;
  };
  // 0fd81b1cd65104dab495ed69fce6834a039853273e1f2fd929cfa9f4700c4eae
  useEffect(() => {
    const playAudio = async (randomNumber: number) => {
      const playable = new Audio.Sound();

      await playable.loadAsync({
        uri: `https://cdn.arbitration.mn/cases/static/${randomNumber}.wav`,
      });

      await playable.playAsync();
    };
    if (counter == 1) {
      playAudio(0);
    }
    if (counter == 2) {
      console.log('PLAYING 2');
      playAudio(2);
    }
    if (counter == 3) {
      playAudio(2);
    }
  }, [counter]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.charcoal[800] }}
      edges={['bottom']}
    >
      <FocusAwareStatusBar />
      <View className="flex-1 bg-black">
        <ScrollView className="flex-1 p-2">
          {counter > 0 && (
            <View className="mb-6">
              <Text className="text-xl font-semibold text-white">
                Та ямар төрлийн зээл авах, мөн боломжтой зээлийн хэмжээгээ
                тооцуулахын тулд регистрийн дугаараа хэлнэ үү?
              </Text>
            </View>
          )}
          {counter > 1 && (
            <View className="mb-6">
              <Text className="text-xl font-semibold text-white">
                Таны регистрийн дугаар УЦ02241511 Таны овог нэр Даян овогтой
                Балжинням.
              </Text>
            </View>
          )}
          {counter > 2 && (
            <View className="mb-6">
              <Text className="text-xl font-semibold text-white">
                Танд гарах боломжтой цалингийн зээлийн дээд хэмжээ 12,500,000
                байна та энэхүү үйлчилгээг авахыг хүсвэл хаан банк аппликейшн
                аль эсвэл салбарт хандана уу.
              </Text>
            </View>
          )}

          <Image
            style={{
              opacity: recording || (counter > 0 && counter < 3) ? 1 : 0,
              width: '100%',
              height: 400,
            }}
            source={require('@assets/loading.gif')}
          />
        </ScrollView>
        <View
          className="items-center  py-4"
          style={{
            backgroundColor: colors.charcoal[800],
          }}
        >
          <Pressable
            style={{
              height: 55,
              width: 55,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 999,
              borderColor: 'white',
              borderWidth: 3,
              padding: 2,
            }}
            onPress={recording ? stop : start}
          >
            <Animated.View
              style={[
                {
                  backgroundColor: 'red',
                },
                animatedStyles,
              ]}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
