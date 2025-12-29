import { MotionValue, motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

/**
 * Props for the Number component.
 */
interface NumberProps {
  /** Motion value representing the animated counter value */
  mv: MotionValue<number>;
  /** The digit (0-9) this component represents */
  number: number;
  /** Height of the digit container in pixels */
  height: number;
}

/**
 * Individual digit component that animates vertically based on the counter value.
 * Calculates the vertical offset needed to display the correct digit based on
 * the current animated value and the digit this component represents.
 *
 * @param {NumberProps} props - Component props
 * @returns {JSX.Element} Animated digit span element
 */
function Number({ mv, number, height }: NumberProps) {
  let y = useTransform(mv, latest => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return <motion.span style={{ ...style, y }}>{number}</motion.span>;
}

/**
 * Props for the Digit component.
 */
interface DigitProps {
  /** Place value (e.g., 10 for tens, 1 for ones) */
  place: number;
  /** Current numeric value to display */
  value: number;
  /** Height of the digit container in pixels */
  height: number;
  /** Optional custom styles to apply to the digit container */
  digitStyle?: React.CSSProperties;
}

/**
 * Single digit container that displays one place value (ones, tens, hundreds, etc.).
 * Contains 10 Number components (0-9) and animates between them based on the value.
 * Uses a spring animation for smooth transitions when the value changes.
 *
 * @param {DigitProps} props - Component props
 * @returns {JSX.Element} Digit container with animated number display
 */
function Digit({ place, value, height, digitStyle }: DigitProps) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  const defaultStyle: React.CSSProperties = {
    height,
    position: 'relative',
    width: '1ch',
    fontVariantNumeric: 'tabular-nums'
  };

  return (
    <div style={{ ...defaultStyle, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

/**
 * Props for the Counter component.
 */
interface CounterProps {
  /** The numeric value to display */
  value: number;
  /** Font size in pixels (default: 100) */
  fontSize?: number;
  /** Additional padding around digits in pixels (default: 0) */
  padding?: number;
  /** Array of place values to display, e.g., [100, 10, 1] for hundreds, tens, ones (default: [100, 10, 1]) */
  places?: number[];
  /** Gap between digits in pixels (default: 8) */
  gap?: number;
  /** Border radius in pixels (default: 4) */
  borderRadius?: number;
  /** Horizontal padding in pixels (default: 8) */
  horizontalPadding?: number;
  /** Text color (default: 'white') */
  textColor?: string;
  /** Font weight (default: 'bold') */
  fontWeight?: React.CSSProperties['fontWeight'];
  /** Optional custom styles for the outer container */
  containerStyle?: React.CSSProperties;
  /** Optional custom styles for the counter display */
  counterStyle?: React.CSSProperties;
  /** Optional custom styles for individual digits */
  digitStyle?: React.CSSProperties;
  /** Height of gradient overlays in pixels (default: 16) */
  gradientHeight?: number;
  /** Starting color for gradients (default: 'black') */
  gradientFrom?: string;
  /** Ending color for gradients (default: 'transparent') */
  gradientTo?: string;
  /** Optional custom styles for the top gradient overlay */
  topGradientStyle?: React.CSSProperties;
  /** Optional custom styles for the bottom gradient overlay */
  bottomGradientStyle?: React.CSSProperties;
}

/**
 * Counter component displays a numeric value with animated digit transitions.
 * Each digit animates smoothly when the value changes, creating a rolling counter effect.
 * Supports customizable styling, multiple place values, and optional gradient overlays.
 *
 * Features:
 * - Smooth spring-based animations for digit transitions
 * - Support for multiple place values (ones, tens, hundreds, etc.)
 * - Customizable styling (colors, fonts, spacing, borders)
 * - Optional gradient overlays for fade effects
 * - Tabular number formatting for consistent digit width
 *
 * @param {CounterProps} props - Component props
 * @returns {JSX.Element} Animated counter display
 *
 * @example
 * ```tsx
 * <Counter value={42} fontSize={48} places={[10, 1]} />
 * ```
 */
export default function Counter({
  value,
  fontSize = 100,
  padding = 0,
  places = [100, 10, 1],
  gap = 8,
  borderRadius = 4,
  horizontalPadding = 8,
  textColor = 'white',
  fontWeight = 'bold',
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 16,
  gradientFrom = 'black',
  gradientTo = 'transparent',
  topGradientStyle,
  bottomGradientStyle
}: CounterProps) {
  const height = fontSize + padding;

  const defaultContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block'
  };

  const defaultCounterStyle: React.CSSProperties = {
    fontSize,
    display: 'flex',
    gap: gap,
    overflow: 'hidden',
    borderRadius: borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    lineHeight: 1,
    color: textColor,
    fontWeight: fontWeight
  };

  const gradientContainerStyle: React.CSSProperties = {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  const defaultTopGradientStyle: React.CSSProperties = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`
  };

  const defaultBottomGradientStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`
  };

  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultCounterStyle, ...counterStyle }}>
        {places.map(place => (
          <Digit key={place} place={place} value={value} height={height} digitStyle={digitStyle} />
        ))}
      </div>
      <div style={gradientContainerStyle}>
        <div style={topGradientStyle ? topGradientStyle : defaultTopGradientStyle} />
        <div style={bottomGradientStyle ? bottomGradientStyle : defaultBottomGradientStyle} />
      </div>
    </div>
  );
}

