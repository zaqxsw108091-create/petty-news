import React, { useEffect } from 'react';
import { View } from 'react-native';
import { CommonActions } from '@granite-js/native/@react-navigation/native';
import { useNavigation } from '@granite-js/react-native';

export default function NotFoundPage() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: '/' }],
      })
    );
  }, [navigation]);

  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
}
