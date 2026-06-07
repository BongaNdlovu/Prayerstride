import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import ScreenScaffold from '../components/ScreenScaffold';
import AppHeader from '../components/AppHeader';
import GlassCard from '../components/GlassCard';
import Heading from '../components/Heading';
import BodyText from '../components/BodyText';

const TOPICS = [
  {
    title: 'Getting Started',
    body: 'Create an account, set up your profile, and start sharing prayer requests or praying for others.',
  },
  {
    title: 'Prayer Requests',
    body: 'Tap the Create tab to share a prayer request. Include a title and details so others know how to pray.',
  },
  {
    title: 'Answered Prayers',
    body: 'When a prayer is answered, mark it answered so your request list stays current.',
  },
  {
    title: 'Notifications',
    body: 'Manage notification preferences in Settings to control what you hear about.',
  },
  {
    title: 'Contact',
    body: 'For support, contact us at support@prayerstride.app',
  },
];

export default function HelpCenterScreen({ onBack }) {
  return (
    <ScreenScaffold pageContent>
      <AppHeader title="Help Center" subtitle="Find answers and get support." onBack={onBack} />
      <View style={styles.topics}>
        {TOPICS.map((topic) => (
          <GlassCard key={topic.title} style={styles.topicCard}>
            <Heading level="h4">{topic.title}</Heading>
            <BodyText variant="body" style={styles.topicBody}>{topic.body}</BodyText>
          </GlassCard>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  topics: { gap: spacing.md },
  topicCard: { marginBottom: 0 },
  topicBody: { marginTop: spacing.sm },
});
