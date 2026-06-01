import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Heart, Star } from 'lucide-react-native';
import { alpha, colors, fonts, radii, spacing } from '../theme';
import { reactToTestimony } from '../api';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';
import MotionPressable from '../components/MotionPressable';

function ReactionButton({ label, count, onPress }) {
  return (
    <MotionPressable onPress={onPress} style={styles.reactionButton}>
      <Heart size={16} color={colors.gold} />
      <BodyText variant="label">{label} · {count}</BodyText>
    </MotionPressable>
  );
}

export default function PraiseDetailScreen({ testimony, onBack }) {
  const [praiseGod, setPraiseGod] = useState(testimony.praiseGod || 0);
  const [amen, setAmen] = useState(testimony.amen || 0);

  useEffect(() => {
    setPraiseGod(testimony.praiseGod || 0);
    setAmen(testimony.amen || 0);
  }, [testimony.id, testimony.praiseGod, testimony.amen]);

  const react = async (key) => {
    try {
      await reactToTestimony(testimony.id, key);
      if (key === 'praiseGod') setPraiseGod((value) => value + 1);
      if (key === 'amen') setAmen((value) => value + 1);
    } catch (error) {
      Alert.alert('Reaction not saved', error.message);
    }
  };

  return (
    <ScreenScaffold pageContent>
      <AppHeader onBack={onBack} title="Praise Report" />

      <View style={styles.badgeRow}>
        <Star size={14} color={colors.gold} fill={colors.gold} />
        <BodyText variant="caption" style={styles.eyebrow}>Answered Prayer</BodyText>
      </View>

      <Heading level="h2" style={styles.title}>{testimony.title}</Heading>
      <BodyText variant="small" style={styles.author}>{testimony.authorName}</BodyText>

      <GlassCard style={styles.card}>
        <BodyText variant="body">{testimony.body}</BodyText>

        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <BodyText variant="label">{(testimony.authorName || 'A').slice(0, 1)}</BodyText>
          </View>
          <BodyText variant="label">{testimony.authorName || 'Anonymous'}</BodyText>
        </View>

        <View style={styles.actionRow}>
          <ReactionButton label="Praise God" count={praiseGod} onPress={() => react('praiseGod')} />
          <ReactionButton label="Amen" count={amen} onPress={() => react('amen')} />
        </View>
      </GlassCard>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  eyebrow: { color: colors.gold, letterSpacing: 1, textTransform: 'uppercase' },
  title: { marginTop: spacing.sm },
  author: { marginTop: spacing.xs, color: colors.gold },
  card: { marginTop: spacing.lg },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha.gold22,
  },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: alpha.ivory16,
    backgroundColor: alpha.ivory10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
