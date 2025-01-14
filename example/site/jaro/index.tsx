import { state, updateState, mqttActuator, mqttSensor, webuiWidget } from 'haah';
import { interpolate } from '../../util/interpolate';

import React  from 'react';
import { Slider, Form } from 'antd';
import { LabeledSwitch } from '../../util/frontend';

export const jarosRoom = state('jaro', {
  lightOn: false,
  comfort: 0.5,
});


webuiWidget('Jaros Light', () => {
  return <Form layout='horizontal'>
    <LabeledSwitch label={"ON"} checked={jarosRoom.lightOn} onChange={value =>
      updateState(jarosRoom, (jarosRoom) => { jarosRoom.lightOn = value })
    }/>
    <Form.Item>
      <Slider  min={0} max={1} step={0.01} value={jarosRoom.comfort} onChange={(value: number) =>
        updateState(jarosRoom, (jarosRoom) => { jarosRoom.comfort = value })
      }/>
    </Form.Item>
  </Form>;
});


mqttSensor('zigbee2mqtt/jaro/switch', (payload) =>
  updateState(jarosRoom, (jarosRoom) => {
    const actions = {
      on() {
        jarosRoom.lightOn = true;
        jarosRoom.comfort = 0.5;
      },

      off() {
        jarosRoom.lightOn = false;
      },

      brightness_move_down() {
        jarosRoom.lightOn = true;
        jarosRoom.comfort = 0;
      },

      brightness_move_up() {
        jarosRoom.lightOn = true;
        jarosRoom.comfort = 1;
      },
    };
    actions[payload.action as keyof typeof actions]();
  }),
);

function jaroNormalLamp(
  min_brightness = 0,
  max_brightness = 254,
  min_color_temp = 250,
) {
  return () => {
    if (!jarosRoom.lightOn) {
      return { state: 'off', brightness: 0, transition: 0 };
    }

    return {
      state: 'on',
      transition: 0,
      ...interpolate(
        jarosRoom.comfort,
        { brightness: min_brightness, color_temp: 454 },
        { brightness: max_brightness, color_temp: min_color_temp },
      ),
    };
  };
}
mqttActuator('zigbee2mqtt/jaro/decke/set', jaroNormalLamp());
mqttActuator('zigbee2mqtt/jaro/desk/set', jaroNormalLamp());
mqttActuator('zigbee2mqtt/jaro/desk_white/set', jaroNormalLamp());
mqttActuator('zigbee2mqtt/jaro/bed/set', jaroNormalLamp(1, 150, 150));

mqttActuator('zigbee2mqtt/jaro/industrie/set', () => {
  if (!jarosRoom.lightOn) {
    return { state: 'off', brightness: 0, transition: 0 };
  }

  return {
    state: 'on',
    transition: 0,
    ...interpolate(
      jarosRoom.comfort,
      { brightness: 130, color: { r: 255, g: 150, b: 0 } },
      { brightness: 150, color: { r: 0, g: 255, b: 200 } },
    ),
  };
});
