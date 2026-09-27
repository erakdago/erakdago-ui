import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const HomeScreen = () => (
  <ThemedView style={styles.container}>
    <ThemedText type="title">Accueil</ThemedText>
    <ThemedText style={styles.description}>
      L&apos;écran principal, avec le suivi de la position en continu, sera
      implémenté séparément plus tard. La carte est pour l&apos;instant
      uniquement sur l&apos;écran de lancement.
    </ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  description: {
    textAlign: 'center',
  },
});

export default HomeScreen;
