import {
  Stack,
  StackProps,
  FormControl,
  FormLabel,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Textarea,
} from "@chakra-ui/react";

export function ConfigForm(props: StackProps) {
  return (
    <Stack {...props}>
      <Text fontWeight="700" fontSize="x-large">
        Configurations
      </Text>
      <form>
        <Stack gap="10px">
          <FormControl>
            <FormLabel>System Instruction</FormLabel>
            <Textarea />
          </FormControl>
          <FormControl>
            <FormLabel>Temperature</FormLabel>
            <Slider>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
              <SliderMark value={0} transform="translate(-50%, 0)" pt="5px">
                0
              </SliderMark>
              <SliderMark value={100} transform="translate(-50%, 0)" pt="5px">
                2
              </SliderMark>
            </Slider>
          </FormControl>
        </Stack>
      </form>
    </Stack>
  );
}
