import Text from './Text';
import SingleModel from './SingleModel';
import Checkbox from './Checkbox';
import Date from './Date';
import DateTime from './DateTime';
import Time from './Time';
import Location from './Location';
import Image from './Image';
import TextArea from './TextArea';
import RichText from './RichText';
import Enum from './Enum';
import EnumByUser from './EnumByUser';
import ArrayImage from './ArrayImage';
import ArrayModel from './ArrayModel';
import ArrayModelSort from './ArrayModelSort';
import ArraySelect from './ArraySelect';
import SingleSelect from './SingleSelect';
import Password from './Password';
import Upload from './Upload';
import Captcha from './Captcha';
import Explain from './Explain';
import NumberMask from './NumberMask';
import NumberRange from './NumberRange';
import RadioGroup from './RadioGroup';
import Slider from './Slider';
import Icon from './Icon';
import Json from './JSONViewer';
import InputTag from './InputTag';
import ColorPicker from './ColorPicker';
import SuggestLocation from './SuggestLocation';

interface WidgetsType {
  [key: string]: any;
}

const Widgets: WidgetsType = {
  NumberRange,
  NumberMask,
  Explain,
  Time,
  Captcha,
  Upload,
  Password,
  ArrayModel,
  ArrayModelSort,
  ArraySelect,
  SingleSelect,
  ArrayImage,
  Enum,
  EnumByUser,
  RichText,
  TextArea,
  Image,
  Location,
  Text,
  InputTag,
  SingleModel,
  Checkbox,
  Date,
  DateTime,
  RadioGroup,
  Slider,
  Icon,
  Json,
  ColorPicker,
  SuggestLocation,
};

export default Widgets;
