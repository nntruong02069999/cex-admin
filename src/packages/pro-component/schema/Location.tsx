import { Component } from 'react'
import { Input } from 'antd'
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from '@react-google-maps/api'
import { IS_DEBUG } from '@src/constants/constants'
class Location extends Component<
  {
    value: any
    onChange: (val: any) => void
  },
  {
    value: any
  }
> {
  searchBox: any

  constructor(props: any) {
    super(props)
    this.state = {
      value: props.value,
    }
  }

  onLoad = (marker: any) => {
    if (IS_DEBUG) {
      console.log('marker: ', marker)
    }
  }

  onLoadSearchbox = (ref: any) => (this.searchBox = ref)

  onPlacesChanged = () => {
    if (IS_DEBUG) {
      console.log(this.searchBox.getPlaces())
    }
  }

  render() {
    let rs = [21.0575491, 105.7909262]
    if (this.props.value) {
      rs = this.props.value.split('/')
      if (!isNaN(Number(rs[0])) && !isNaN(Number(rs[1]))) {
        rs[0] = Number(rs[0])
        rs[1] = Number(rs[1])
      }
    }
    return (
      <div>
        <Input
          type="text"
          id="name"
          placeholder="Nhập địa chỉ gps. Ví dụ: 21.0575491/105.7909262"
          required
          value={this.props.value}
          onChange={(evt) => {
            if (this.props.onChange) {
              this.props.onChange(evt.target.value)
            }
          }}
        />
        {/* <Button color="default">Nhập vị trí</Button> */}

        <div style={{ marginTop: '15px' }}>
          <LoadScript
            googleMapsApiKey={
              process.env.REACT_APP_GOOGLEMAP_KEY ||
              'AIzaSyCvhbglopnJjQEccKGHbnh1x_r1JyLcE0c'
            }
            libraries={['places', 'geometry', 'drawing']}
          >
            <GoogleMap
              mapContainerStyle={{
                // width: '400px',
                height: '300px',
              }}
              center={{ lat: rs[0], lng: rs[1] }}
              zoom={10}
            >
              {/* Child components, such as markers, info windows, etc. */}
              <>
                <StandaloneSearchBox
                  onLoad={this.onLoadSearchbox}
                  onPlacesChanged={this.onPlacesChanged}
                  // bounds={props.bounds}
                  /* controlPosition={
                    (window as any).google.maps.ControlPosition.TOP_LEFT
                  } */
                >
                  <input
                    type="text"
                    placeholder="Tìm kiếm địa chỉ"
                    style={{
                      boxSizing: `border-box`,
                      border: `1px solid transparent`,
                      width: `240px`,
                      height: `32px`,
                      padding: `0 12px`,
                      borderRadius: `3px`,
                      boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                      fontSize: `14px`,
                      outline: `none`,
                      textOverflow: `ellipses`,
                      position: 'absolute',
                      left: '50%',
                      marginLeft: '-120px',
                    }}
                  />
                </StandaloneSearchBox>
                <Marker
                  onLoad={this.onLoad}
                  position={{ lat: rs[0], lng: rs[1] }}
                  draggable={true}
                  onDragEnd={(evt: any) => {
                    if (this.props.onChange) {
                      const rs = `${evt.latLng.lat()}/${evt.latLng.lng()}`
                      this.props.onChange(rs)
                    }
                  }}
                />
              </>
            </GoogleMap>
          </LoadScript>
          {/* <MapWithAMarker
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyCvhbglopnJjQEccKGHbnh1x_r1JyLcE0c&v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `400px` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            lat={rs[0]}
            lng={rs[1]}
            onChange={(val: any) => {
              if (this.props.onChange) {
                this.props.onChange(val)
              }
            }}
          /> */}
        </div>
      </div>
    )
  }
}

export default Location
