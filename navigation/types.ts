import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// ─── Drawer Stack ───
export type DrawerParamList = {
  MainTabs: undefined;
  LocalTracks: undefined;
  Settings: undefined;
  FAQ: undefined;
};

// ─── Auth Stack ───
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// ─── Main Stack (root after login) ───
export type MainStackParamList = {
  HomeDrawer: undefined;
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
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    NativeStackNavigationProp<MainStackParamList>
  >
>;

// ─── Convenience types ───
export type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavProp = NativeStackNavigationProp<MainStackParamList>;
export type PlaylistDetailRouteProp = RouteProp<MainStackParamList, 'PlaylistDetail'>;
