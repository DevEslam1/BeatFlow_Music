import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// ─── Auth Stack ───
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// ─── Main Stack (root after login) ───
export type MainStackParamList = {
  HomeTabs: undefined;
  Player: undefined;
  Favorites: undefined;
  Recent: undefined;
  PlaylistDetail: { id: string };
  CreatePlaylist: undefined;
};

// ─── Bottom Tabs ───
export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Profile: undefined;
};

// ─── Composite nav types for tabs (tab + parent stack) ───
export type TabScreenNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

// ─── Convenience types ───
export type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavProp = NativeStackNavigationProp<MainStackParamList>;
export type PlaylistDetailRouteProp = RouteProp<MainStackParamList, 'PlaylistDetail'>;
