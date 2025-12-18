import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getTimeRangeOptions, type TimeRangeOption } from '@/utils/timeRanges';
import { DecoColors } from '@/constants/Colors';
import { typography, spacing, chamfer, stroke, shadows } from '@/constants/theme';

export const options = {
  headerShown: false,
};

// Decorative chevron pattern
function ChevronDecoration({ color = DecoColors.mint, opacity = 0.3 }: { color?: string; opacity?: number }) {
  return (
    <View style={[chevronStyles.container, { opacity }]}>
      <View style={[chevronStyles.chevron, { borderColor: color }]} />
      <View style={[chevronStyles.chevron, chevronStyles.chevron2, { borderColor: color }]} />
      <View style={[chevronStyles.chevron, chevronStyles.chevron3, { borderColor: color }]} />
    </View>
  );
}

const chevronStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 40,
  },
  chevron: {
    width: 20,
    height: 20,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '45deg' }],
    marginBottom: -12,
  },
  chevron2: {
    marginBottom: -12,
  },
  chevron3: {
    marginBottom: 0,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption | null>(
    getTimeRangeOptions()[0]
  );

  const ranges = getTimeRangeOptions();

  function handleGenerate() {
    if (!selectedRange) return;
    
    router.push({
      pathname: '/processing',
      params: {
        start: selectedRange.start.getTime().toString(),
        end: selectedRange.end.getTime().toString(),
      },
    });
  }

  return (
    <View style={styles.container}>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header section with decorative elements */}
        <View style={styles.header}>
          <View style={styles.headerDecor}>
            <View style={styles.headerLine} />
            <View style={styles.headerDiamond} />
            <View style={styles.headerLine} />
          </View>
          
          <Text style={styles.title}>SELECT PERIOD</Text>
          
          <View style={styles.doubleLine}>
            <View style={styles.lineTop} />
            <View style={styles.lineBottom} />
          </View>
          
          <Text style={styles.subtitle}>Choose the time range to analyze</Text>
        </View>

        {/* Chevron decoration */}
        <ChevronDecoration />

        {/* Options panel */}
        <View style={styles.optionsPanel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderLine} />
            <Text style={styles.panelHeaderText}>TIME RANGE</Text>
            <View style={styles.panelHeaderLine} />
          </View>
          
          <View style={styles.options}>
            {ranges.map((range, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.option,
                  selectedRange?.label === range.label && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => setSelectedRange(range)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionIndicator,
                    selectedRange?.label === range.label && styles.optionIndicatorActive,
                  ]} />
                  <Text
                    style={[
                      styles.optionText,
                      selectedRange?.label === range.label && styles.optionTextSelected,
                    ]}
                  >
                    {range.label}
                  </Text>
                </View>
                {selectedRange?.label === range.label && (
                  <View style={styles.optionAccent} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Generate button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            !selectedRange && styles.buttonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={!selectedRange}
        >
          <Text style={styles.buttonText}>GENERATE WRAPPED</Text>
        </Pressable>

        {/* Bottom decorative element */}
        <View style={styles.bottomDecor}>
          <View style={styles.bottomLine} />
          <View style={styles.bottomDiamond} />
          <View style={styles.bottomLine} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DecoColors.background,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 80,
    paddingBottom: spacing.xxxl,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLine: {
    width: 30,
    height: 1,
    backgroundColor: DecoColors.mint,
  },
  headerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: DecoColors.mint,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.sm,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  doubleLine: {
    width: 100,
    marginBottom: spacing.md,
  },
  lineTop: {
    height: 1,
    backgroundColor: DecoColors.mint,
    marginBottom: 4,
  },
  lineBottom: {
    height: 1,
    backgroundColor: DecoColors.mint,
  },
  subtitle: {
    ...typography.body,
    color: DecoColors.text.muted,
    textAlign: 'center',
  },

  // Options panel
  optionsPanel: {
    backgroundColor: DecoColors.panel,
    borderWidth: stroke.standard,
    borderColor: DecoColors.stroke.subtle,
    borderRadius: chamfer.md,
    padding: spacing.lg,
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  panelHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: DecoColors.stroke.subtle,
  },
  panelHeaderText: {
    ...typography.caption,
    color: DecoColors.text.muted,
    letterSpacing: 2,
    marginHorizontal: spacing.md,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: DecoColors.background,
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
    borderRadius: chamfer.sm,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  optionSelected: {
    borderColor: DecoColors.mint,
    borderWidth: stroke.standard,
  },
  optionPressed: {
    backgroundColor: DecoColors.states.hover,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: stroke.hairline,
    borderColor: DecoColors.stroke.subtle,
    marginRight: spacing.md,
  },
  optionIndicatorActive: {
    backgroundColor: DecoColors.mint,
    borderColor: DecoColors.mint,
  },
  optionText: {
    ...typography.bodyMedium,
    color: DecoColors.text.primary,
  },
  optionTextSelected: {
    color: DecoColors.mint,
  },
  optionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: DecoColors.mint,
  },

  // Button
  button: {
    backgroundColor: DecoColors.mint,
    borderWidth: stroke.standard,
    borderColor: DecoColors.mint,
    borderRadius: chamfer.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.sage,
  },
  buttonPressed: {
    backgroundColor: DecoColors.mintDark,
  },
  buttonDisabled: {
    opacity: 0.4,
    backgroundColor: DecoColors.panel,
    borderColor: DecoColors.stroke.subtle,
    ...shadows.subtle,
  },
  buttonText: {
    ...typography.button,
    color: DecoColors.teal,
  },

  // Bottom decoration
  bottomDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLine: {
    width: 50,
    height: 1,
    backgroundColor: DecoColors.stroke.subtle,
  },
  bottomDiamond: {
    width: 8,
    height: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DecoColors.stroke.subtle,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.lg,
  },
 
});
