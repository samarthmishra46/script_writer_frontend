import * as React from "react";
import Svg, { Circle, Text } from "react-native-svg";
const SVGComponent = () => (
  <Svg
    height="800px"
    width="800px"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    
  >
    <Circle cx={256} cy={256} r={256} fill="#EFB832" />
    <Circle
      cx={256}
      cy={256}
      r={216}
      fill="none"
      stroke="#AE8132"
      strokeWidth={16}
    />
    <Text
      x={256}
      y={265}
      textAnchor="middle"
      fontSize={96}
      fontWeight={700}
      fontFamily=" Arial, sans-serif"
      fill="#CC9322"
      letterSpacing={2}
    >
      {"\n    LiPi\n  "}
    </Text>
    <Text
      x={256}
      y={350}
      textAnchor="middle"
      fontSize={96}
      fontWeight={700}
      fontFamily=" sans-serif"
      fill="#CC9322"
      letterSpacing={2}
    >
      {"\n    Coin\n  "}
    </Text>
    <Circle cx={66} cy={256} r={9.5} fill="#EFB832" />
    <Circle cx={446} cy={256} r={9.5} fill="#EFB832" />
  </Svg>
);
export default SVGComponent;
