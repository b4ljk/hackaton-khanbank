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
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [sound, setSound] = useState<any>();
  const [recordings, setRecordings] = useState<any>([]);

  const makeAudio = async (text: string) => {
    try {
      console.log('START');

      text = filterMongolianCyrillicAndPunctuation(text).toLowerCase();

      console.log('TEST');
      console.log('TEST');

      console.log(text.trim());

      console.log('TEST');
      console.log('TEST');

      const response = await fetch('https://api.chimege.com/v1.2/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'plain/text',
          Token:
            '0fd81b1cd65104dab495ed69fce6834a039853273e1f2fd929cfa9f4700c4eae',
          'voice-id': 'MALE3v2',
        },
        body: text,
      });
      const randomNumber = Math.floor(Math.random() * 1000000);

      console.log(response, 'response');

      const arrayBuffer = await response.arrayBuffer();

      const uploadUrl = await fetch(
        `https://www.arbitration.mn/api/file/simple-put?name=${randomNumber}.wav&caseId=hackaton`
      ).then((res) => res.json());

      console.log(uploadUrl, 'uploadUrl');

      // upload to s3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'audio/wav',
        },
        body: arrayBuffer,
      });

      const playable = new Audio.Sound();

      await playable.loadAsync({
        uri: `https://cdn.arbitration.mn/cases/hackaton/${randomNumber}.wav`,
      });

      await playable.playAsync();
    } catch (e) {
      console.log('ERROR');
      console.log('ERROR');
      console.log(e);
      console.log('ERROR');
      console.log('ERROR');
    }
  };

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
    formData.append('file', blob);

    const response = await fetch('https://api.chimege.com/v1.2/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        Punctuate: 'true',
        Token:
          '4dfec85d3220a8c97d813beaf2de2508a34cfb0a4cdd1b3c650cd2f23fee2542',
      },
      body: blob, // Sent as binary data.
    });

    // only 300 character limit
    const text = (await response.text()).slice(0, 299);

    makeAudio(text);
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.charcoal[800] }}
      edges={['bottom']}
    >
      <FocusAwareStatusBar />
      <View className="flex-1 bg-black">
        <View className="flex-1 justify-center">
          <Image
            style={{
              opacity: recording ? 1 : 0,
              width: '100%',
              height: 400,
            }}
            source={require('@assets/loading.gif')}
          />
        </View>
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
