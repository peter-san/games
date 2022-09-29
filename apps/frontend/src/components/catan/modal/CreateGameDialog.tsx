import { Form, Modal, Radio, Switch } from "antd";
import { Color } from "../../catan-single/model/Player";

export type JoinGameRequest = {
  color: Color;
};

export type CreateGameRequest = {
  standard: boolean;
  color: Color;
};

interface GameCreationFormProps {
  visible: boolean;
  usedColors: Color[];
  onCreate: (values: CreateGameRequest) => void;
  onCancel: () => void;
}

export const CreateGameDialog = ({
  visible,
  onCreate,
  usedColors,
  onCancel,
}: GameCreationFormProps) => {
  const creation = usedColors.length === 0;

  const [form] = Form.useForm();

  const allColors = [Color.ORANGE, Color.RED, Color.BLUE, Color.MAGENTA];

  const toOption = (color: Color) => {
    return {
      value: color,
      label: color,
      disabled: usedColors.findIndex((c) => c === color) !== -1,
      style: {
        backgroundColor: color,
        borderRadius: 10,
        marginRight: 5
      }
    }
  }

  return (
    <Modal
      visible={visible}
      okText={creation ? "Create" : "Join"}
      cancelText="Cancel"
      onCancel={onCancel}
      style = {
        {
          borderRadius: 30
        }
      }
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            console.log(values);
            onCreate(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Form
        form={form}
        layout="horizontal"
        name="form_in_modal"
        initialValues={{ standard: false }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item name="color" label="select color">
          <Radio.Group
          
            options={allColors.map(toOption)}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
        {usedColors.length === 0 ? (
          <Form.Item
            label="beginner setup"
            name="standard"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        ) : undefined}
      </Form>
    </Modal>
  );
};
