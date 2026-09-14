/**
 * RWS-branded onboarding welcome — host-owned via MapExperience.Onboarding `renderWelcome`.
 */

import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {useAppTheme, type RenderWelcomeArgs} from '@twinmatrix/rn-ui-sdk';

/** Exact RWS web welcome copy — host-owned via `renderWelcome`. */
const RWS = {
  welcomeTitle: 'Welcome to\nResorts World Sentosa',
  welcomeContinue: 'Continue',
  allowLocation: 'Allow using my location',
} as const;

function RwsOverlayCard({children}: {children: React.ReactNode}) {
  const theme = useAppTheme();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.rwsOverlay, {backgroundColor: 'rgba(255,255,255,0.35)'}]}>
      <View
        style={[
          styles.rwsCard,
          {
            backgroundColor: theme.surface.card,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

function RwsPrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.rwsPrimaryBtn,
        {
          backgroundColor: theme.accent.secondary,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.85 : 1,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}>
      <Text
        style={{
          color: theme.text.onAccent,
          textAlign: 'center',
          fontWeight: '600',
          fontSize: 16,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function renderRwsWelcome({
  allowLocation,
  setAllowLocation,
  onContinue,
}: RenderWelcomeArgs) {
  return (
    <Modal visible transparent animationType="fade">
      <RwsWelcomeScreen
        allowLocation={allowLocation}
        setAllowLocation={setAllowLocation}
        onContinue={onContinue}
      />
    </Modal>
  );
}

function RwsWelcomeScreen({
  allowLocation,
  setAllowLocation,
  onContinue,
}: RenderWelcomeArgs) {
  const theme = useAppTheme();
  const paragraph = {
    color: theme.text.primary,
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  };
  return (
    <RwsOverlayCard>
      <Text
        style={{
          color: theme.text.primary,
          textAlign: 'center',
          fontSize: 22,
          fontWeight: '700',
          marginBottom: theme.spacing.md,
        }}>
        {RWS.welcomeTitle}
      </Text>
      <View style={{gap: theme.spacing.sm, marginBottom: theme.spacing.md}}>
        <Text style={paragraph}>
          This Digital Wayfinding App is currently in a test (beta) phase and may
          have limitations.
        </Text>
        <Text style={paragraph}>
          Thank you for helping us improve the experience.
        </Text>
      </View>
      <Text
        style={{
          color: theme.text.primary,
          textAlign: 'center',
          fontSize: 12,
          lineHeight: 18,
          marginBottom: theme.spacing.md,
        }}>
        By clicking "Continue", you acknowledge and agree to our{' '}
        <Text style={{color: theme.accent.secondary, fontWeight: '600'}}>
          Terms of Use
        </Text>
        .
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
        }}>
        <Switch
          value={allowLocation}
          onValueChange={setAllowLocation}
          accessibilityLabel={RWS.allowLocation}
        />
        <Text style={{color: theme.text.primary, flex: 1, fontSize: 14}}>
          {RWS.allowLocation}
        </Text>
      </View>
      <RwsPrimaryButton label={RWS.welcomeContinue} onPress={onContinue} />
    </RwsOverlayCard>
  );
}

const styles = StyleSheet.create({
  rwsOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  rwsCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'stretch',
  },
  rwsPrimaryBtn: {
    alignSelf: 'stretch',
  },
});
