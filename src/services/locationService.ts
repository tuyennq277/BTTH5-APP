import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

export async function getCurrentLocation(): Promise<string> {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: Platform.OS === 'android',
    authorizationLevel: 'whenInUse',
  });
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Bạn chưa cấp quyền vị trí.');
    }
  }
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position =>
        resolve(
          `${position.coords.latitude.toFixed(
            5,
          )}, ${position.coords.longitude.toFixed(5)}`,
        ),
      () => reject(new Error('Không lấy được vị trí. Hãy bật GPS và thử lại.')),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  });
}
