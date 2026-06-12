import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';

const TOPICS = [
  {
    title: 'Start Here',
    body: 'PrayerStride helps you pray faithfully for real people without turning prayer into a competition.',
    items: [
      'Use Feed to read current prayer requests and move through them at your own pace.',
      'Use the prayer timer when you want to pray with focus and log a private session.',
      'Use Stride to review your personal prayer rhythm, streaks, and prayer time.',
    ],
  },
  {
    title: 'Feed and Prayer Requests',
    body: 'The Feed is where you read, save, and respond to requests from your church family.',
    items: [
      'Tap the share icon to create a request, choose a category, and add helpful details.',
      'Open a request to see the full prayer, start the timer, save it, or use More for available actions.',
      'Mark your own request answered when God has moved so your list stays current.',
    ],
  },
  {
    title: 'Praying With The Timer',
    body: 'Timed sessions help you slow down, stay present, and record your faithfulness privately.',
    items: [
      'Choose a preset time or start a free prayer session from a request.',
      'When the session ends, log it so your weekly rhythm and private streak update.',
      'After a focused session, the app can show that you prayed for that request without ranking you against anyone.',
    ],
  },
  {
    title: 'Prayer Chain',
    body: 'Prayer Chain shows shared ministry impact without naming, ranking, or comparing people.',
    items: [
      'Community impact summarizes how many prayers were logged together.',
      'Cooperative goals help your church family pray for people as one body.',
      'The Shared Prayer Wall gives you a simple place to continue praying for open requests.',
    ],
  },
  {
    title: 'Stride and Encouragements',
    body: 'Your growth tools are personal, gentle, and focused on showing up with God.',
    items: [
      'Stride shows your weekly prayer rhythm, total sessions, prayer time, and private streak.',
      'Encouragements celebrate patterns like consistency, reminders, and companionship.',
      'Journey stages such as Seed, Root, Branch, and Fruit reflect growth rather than status.',
    ],
  },
  {
    title: 'Profile and Prayer Times',
    body: 'Your profile gathers your personal prayer journey and quick links in one place.',
    items: [
      'Edit your profile details and picture from the profile screen.',
      'Open Prayer Times to set reminder windows that fit your daily rhythm.',
      'Use Announcements to read community updates shared through the app.',
    ],
  },
  {
    title: 'Notifications and Settings',
    body: 'Settings lets you choose how PrayerStride supports you throughout the week.',
    items: [
      'Notification Settings controls prayer activity, announcements, and reminder alerts.',
      'Dark Mode, Sound and Haptics, Milestone Cues, and Streak Reminders can be adjusted any time.',
      'If you need to leave the app, Delete Account is available from Settings.',
    ],
  },
  {
    title: 'Privacy and Safety',
    body: 'PrayerStride is a ministry tool, so use care with sensitive information.',
    items: [
      'Only share prayer details you are comfortable allowing others in the app to read.',
      'Report a concern from a prayer request if something appears unsafe or inappropriate.',
      'For emergencies or urgent personal safety concerns, contact local emergency services or a trusted leader directly.',
    ],
  },
  {
    title: 'Need Help',
    body: 'For app support, contact us at support@prayerstride.app.',
    items: ['Include what you were trying to do, what happened, and the screen where you noticed it.'],
  },
];

function TopicCard({ topic }) {
  return (
    <GlassCard style={styles.topicCard}>
      <Heading level="h4">{topic.title}</Heading>
      <BodyText variant="body" style={styles.topicBody}>
        {topic.body}
      </BodyText>
      <View style={styles.itemList}>
        {topic.items.map((item, index) => (
          <View key={`${topic.title}-${index}`} style={styles.itemRow}>
            <View style={styles.dot} />
            <BodyText variant="small" style={styles.itemText}>
              {item}
            </BodyText>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export default function HelpCenterScreen({ onBack }) {
  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Help Center" subtitle="Find answers and get support." onBack={onBack} />
      <View style={styles.topics}>
        {TOPICS.map((topic) => (
          <TopicCard key={topic.title} topic={topic} />
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  topics: { gap: spacing.md },
  topicCard: { marginBottom: 0 },
  topicBody: { marginTop: spacing.sm },
  itemList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  itemRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    backgroundColor: colors.gold,
    borderRadius: 4,
    height: 8,
    marginTop: 6,
    width: 8,
  },
  itemText: {
    flex: 1,
  },
});
