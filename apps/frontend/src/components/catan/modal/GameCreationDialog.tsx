import { Form, Input, Modal, Radio, Switch } from "antd";

export type GameCreation = {
  standard: boolean;
  red?: String,
  orange?: String,
  blue?: String,
  magenta?: String
};

interface GameCreationFormProps {
  visible: boolean;
  onCreate: (values: GameCreation) => void;
  onCancel: () => void;
}

export const GameCreationDialog = ({
  visible,
  onCreate,
  onCancel,
}: GameCreationFormProps) => {
  const [form] = Form.useForm();

  return (
    <Modal
      visible={visible}
      okText="Create"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
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
        <Form.Item label="red" name="red">
          <Input />
        </Form.Item>
        <Form.Item label="orange" name="orange">
          <Input />
        </Form.Item>
        <Form.Item label="blue" name="blue">
          <Input />
        </Form.Item>
        <Form.Item label="magenta" name="magenta">
          <Input />
        </Form.Item>
        <Form.Item label="beginner setup" name="standard" valuePropName="checked">
          <Switch />
          
        </Form.Item>
      </Form>
    </Modal>
  );
};
