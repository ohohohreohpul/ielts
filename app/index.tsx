import { View, Text, StyleSheet, Image } from 'react-native';
import { Card, Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';

export default function Home() {
  return (
    <View style={styles.container}>
      <Card variant="elevated" style={styles.card}>
        <Card.Content>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to Blink!</Text>
          <Text style={styles.description}>
            Let's start developing your mobile app
          </Text>
        </Card.Content>
        <Card.Footer>
          <Button variant="primary" onPress={() => console.log('Get Started!')}>
            Get Started
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  icon: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 