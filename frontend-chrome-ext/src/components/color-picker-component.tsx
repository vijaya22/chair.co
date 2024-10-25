import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";

export function ColorPickerComponent() {
  const [color, setColor] = useColor("rgb(86 30 203)");

  return <ColorPicker color={color} onChange={setColor} />;
}