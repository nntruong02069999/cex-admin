import { AutoComplete, Input, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import './SuggestLocation.css';
const instance = axios.create({});

type ILocation = {
  name: string;
  latitude: number;
  longitude: number;
};

type IProps = {
  schema: Record<string, any>;
  disabled?: boolean;
  invalid?: boolean;
  value?: string;
  onChange?: (val: any) => void;
};

const SuggestLocation = (props: IProps) => {
  const [options, setOptions] = useState<any[]>([]);
  const [coordinate, setCoordinate] = useState(props.value ?? "");
  const [loading, setLoading] = useState(false);
  const timeRef = useRef<any>(null);
  const [lat = "21.0678665", long = "105.7937948"] = coordinate.split("/");

  useEffect(() => {
    if (props.value && props.value !== coordinate) {
      setCoordinate(props.value);
    }
  }, [props.value]);

  const onSearch = async (searchText: string) => {
    clearTimeout(timeRef.current);
    if (!searchText) {
      setOptions([]);
      setLoading(false);
      return;
    }
    timeRef.current = setTimeout(() => search(searchText), 1000);
  };


  const search = async (searchText: string) => {
    try {
      const baseUrlUpload = process.env.REACT_APP_URL
        ? process.env.REACT_APP_URL
        : window.location.origin;
      setLoading(true);
      setOptions([{}]);
      let rs = await instance.get(
        `${baseUrlUpload}/api/admin/map/search?place=${searchText}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (rs.data) {
        let convert = rs.data.map((item: ILocation) => {
          return {
            latitude: item.latitude,
            longitude: item.longitude,
            value: item.name,
          };
        });
        setLoading(false);
        setOptions(convert);
      }
    } catch (error) {
      setLoading(false);
      setOptions([]);
    }
  };

  const onSelect = (data: any) => {
    setCoordinate(`${data.latitude}/${data.longitude}`);
    props.onChange?.(`${data.latitude}/${data.longitude}`);
  };

  return (
    <>
      <Input
        value={coordinate}
        onChange={(e) => {
          setCoordinate(e.target.value);
          props.onChange?.(e.target.value);
        }}
      />
      <AutoComplete
        options={options}
        style={{
          width: "100%",
          marginTop: 12,
          marginBottom: 12,
        }}
        onSelect={(_, option) => onSelect(option)}
        onSearch={onSearch}
        showAction={["focus"]}
        dropdownRender={
          loading
            ? () => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 8,
                  }}
                >
                  {" "}
                  <Spin />
                </div>
              )
            : undefined
        }
      >
        <Input.TextArea
          placeholder="Tìm kiếm địa điểm"
          style={{ height: 60 }}
        />
      </AutoComplete>
      {props.schema?.showMap ? (
        <iframe
          width="100%"
          height="270"
          style={{ borderRadius: 12, border: "none" }}
          src={`https://maps.google.com/maps?q=${lat},${long}&hl=vi&z=17&output=embed`}
        />
      ) : null}
    </>
  );
};

export default SuggestLocation;
