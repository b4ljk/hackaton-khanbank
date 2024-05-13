import { Audio } from 'expo-av';
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
  FocusAwareStatusBar,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/ui';

export default function Feed() {
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [sound, setSound] = useState<any>();
  const [recordings, setRecordings] = useState<any>([]);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        const response = await requestPermission();
        console.log(response, 'resp');
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    if (!recording) return;

    await recording?.stopAndUnloadAsync();
    let allRecordings = [...recordings];
    const { sound, status } = await recording?.createNewLoadedSoundAsync();

    allRecordings.push({
      sound: sound,
      // @ts-ignore
      duration: getDurationFormatted(status?.durationMillis || 0),
      file: recording.getURI(),
    });

    const bufferFile = await fetch(recording?.getURI() ?? '');

    const blob = await bufferFile.blob();

    let formData = new FormData();
    formData.append('file', blob); // Assuming the API accepts the file with a 'file' key.

    const response = await fetch('https://api.chimege.com/v1.2/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        Punctuate: 'true', // Custom headers might not be supported here.
        Token:
          '4dfec85d3220a8c97d813beaf2de2508a34cfb0a4cdd1b3c650cd2f23fee2542',
      },
      body: blob, // Sent as binary data.
    });

    const text = await response.text();
    console.log(text, 'text');

    const jsonized = await response.json();
    console.log(jsonized, 'jsonized');

    setRecordings(allRecordings);
  }

  function getDurationFormatted(milliseconds: number) {
    const minutes = milliseconds / 1000 / 60;
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
    return seconds < 10
      ? `${Math.floor(minutes)}:0${seconds}`
      : `${Math.floor(minutes)}:${seconds}`;
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  function getRecordingLines() {
    return recordings.map(
      (
        recordingLine: {
          duration:
            | string
            | number
            | boolean
            | React.ReactElement<any, string | React.JSXElementConstructor<any>>
            | Iterable<React.ReactNode>
            | React.ReactPortal
            | null
            | undefined;
          sound: { replayAsync: () => void };
        },
        index: React.Key | null | undefined
      ) => {
        return (
          <View key={index}>
            <Text>{recordingLine.duration}</Text>
            <Button
              label="Play"
              onPress={() => {
                console.log('Playing sound');
                recordingLine.sound.replayAsync();
              }}
            />
          </View>
        );
      }
    );
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
    startRecording();
    animatedBorderRadius.value -= 105;
    animatedHeight.value -= 15;
    animatedWidth.value -= 15;
  };

  const stop = () => {
    stopRecording();
    animatedBorderRadius.value = 112;
    animatedHeight.value = 40;
    animatedWidth.value = 40;
  };
  // 0fd81b1cd65104dab495ed69fce6834a039853273e1f2fd929cfa9f4700c4eae
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1">
        <FocusAwareStatusBar />

        {/* <ScrollView className="flex-1">{getRecordingLines()}</ScrollView> */}
        <View className="flex-1 justify-center bg-black">
          {recording && (
            <Image
              className="h-96 w-full"
              source={{
                uri: 'https://cdn.dribbble.com/users/214929/screenshots/4967879/media/cfc4a40efd67ae4810a0975a738d2145.gif',
              }}
            />
          )}
        </View>
        <View className="items-center py-4">
          {/* <Button
            className="h-14 w-14 rounded-full border-2 border-white bg-red-500"
            onPress={start}
          /> */}
          <Pressable
            className="items-center justify-center rounded-full border-2 border-white p-1"
            style={{ height: 50, width: 50 }}
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
