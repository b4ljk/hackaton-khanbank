import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';

import { Button, FocusAwareStatusBar, SafeAreaView, Text, View } from '@/ui';

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

    console.log(status);

    allRecordings.push({
      sound: sound,
      // @ts-ignore
      duration: getDurationFormatted(status?.durationMillis || 0),
      file: recording.getURI(),
    });

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
                recordingLine.sound.replayAsync();
              }}
            />
          </View>
        );
      }
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1">
        <FocusAwareStatusBar />
        <Text>sex</Text>
        <Button
          label={recording ? 'Stop Recording' : 'Start Recording'}
          onPress={recording ? stopRecording : startRecording}
        />
        <View>{getRecordingLines()}</View>
      </View>
    </SafeAreaView>
  );
}
