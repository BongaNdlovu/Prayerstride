import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useTestimonies } from '../usePrayerData';
import { reactToTestimony } from '../api';
import CinematicScreen from '../components/CinematicScreen';
import EmptyState from '../components/EmptyState';
import PageHero from '../components/PageHero';
import TestimonyCard from '../components/TestimonyCard';

export default function PraiseScreen({ onOpenTestimony }) {
  const { testimonies, loading } = useTestimonies(true);
  const [reacted, setReacted] = useState({});

  const react = async (id, key) => {
    if (reacted[`${id}:${key}`]) return;
    setReacted((current) => ({ ...current, [`${id}:${key}`]: true }));
    try {
      await reactToTestimony(id, key);
    } catch (error) {
      setReacted((current) => ({ ...current, [`${id}:${key}`]: false }));
      Alert.alert('Reaction not saved', error.message);
    }
  };

  return (
    <CinematicScreen pageContent>
      <PageHero scene="answered" eyebrow="Praise" title="Answered prayers, remembered" subtitle="Celebrate light breaking through ordinary days." compact />
      {loading ? <ActivityIndicator color={colors.navy} /> : null}
      {testimonies.length === 0 ? <EmptyState label="No testimonies yet." /> : null}
      {testimonies.map((testimony) => (
        <Pressable key={testimony.id} onPress={() => onOpenTestimony && onOpenTestimony(testimony)}>
          <TestimonyCard
            testimony={{
              ...testimony,
              praiseGod: testimony.praiseGod + (reacted[`${testimony.id}:praiseGod`] ? 1 : 0),
              amen: testimony.amen + (reacted[`${testimony.id}:amen`] ? 1 : 0),
            }}
            onReact={react}
          />
        </Pressable>
      ))}
    </CinematicScreen>
  );
}
