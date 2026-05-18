import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BarChart3, Heart, Home, Plus, Sparkles, User } from 'lucide-react-native';
import { colors } from '../theme';

const tabs = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'myPrayers', label: 'Prayers', icon: Sparkles },
  { key: 'create', label: 'Create', icon: Plus },
  { key: 'praise', label: 'Praise', icon: Heart },
  { key: 'myStats', label: 'Stats', icon: BarChart3 },
  { key: 'profile', label: 'Profile', icon: User },
];

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 18, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: 'rgba(248,243,234,0.12)', backgroundColor: '#080b13' },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: colors.gold },
  tabLabel: { color: 'rgba(248,243,234,0.62)', fontSize: 10, fontWeight: '700' },
  tabLabelActive: { color: colors.gold },
});

export default function BottomTabs({ active, onChange }) {
  return (
    <View style={styles.tabs}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const selected = key === active;
        return (
          <Pressable key={key} onPress={() => onChange(key, {})} style={styles.tabItem}>
            <View style={[styles.tabIcon, selected && styles.tabIconActive]}>
              <Icon size={20} color={selected ? colors.ink : 'rgba(248,243,234,0.6)'} />
            </View>
            <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
