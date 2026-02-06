/// <reference types="expo/types" />

declare module "@react-native-community/datetimepicker" {
  import { ViewStyle } from "react-native";
  interface DateTimePickerProps {
    value: Date;
    mode?: "date" | "time" | "datetime";
    minimumDate?: Date;
    maximumDate?: Date;
    onChange?: (event: { type: string }, date?: Date) => void;
    style?: ViewStyle;
  }
  const DateTimePicker: import("react").ComponentType<DateTimePickerProps>;
  export default DateTimePicker;
}
