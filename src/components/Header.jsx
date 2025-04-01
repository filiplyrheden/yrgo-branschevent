import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header>
      <svg
        className="yrgo-logo"
        xmlns="http://www.w3.org/2000/svg"
        width="163"
        height="39"
        viewBox="0 0 163 39"
        fill="none"
      >
        <path
          d="M62.8027 1.11951H46.3265C45.3659 1.11951 44.5438 1.70299 44.194 2.53507C44.0684 2.82108 43.9961 3.13509 43.9961 3.46631V35.4557C43.9961 36.7341 45.0301 37.7688 46.3086 37.7688C47.5871 37.7688 48.6209 36.7341 48.6209 35.4557V5.74563H62.8027C66.6797 5.74563 69.8352 8.89949 69.8352 12.7796C69.8352 16.6597 66.6797 19.8145 62.8027 19.8145H54.7047C53.4263 19.8145 52.392 20.8491 52.392 22.1274C52.392 23.4057 53.4263 24.4402 54.7047 24.4402H62.8027C69.2293 24.4402 74.4602 19.2088 74.4602 12.7796C74.4602 6.35047 69.2293 1.11951 62.8027 1.11951Z"
          fill="#E51236"
        />
        <path
          d="M111.437 19.2434H102.07C100.794 19.2434 99.7574 20.2777 99.7574 21.5565C99.7574 22.8352 100.794 23.8686 102.07 23.8686H109.124V35.5538C109.124 36.8314 110.158 37.867 111.437 37.867C112.716 37.867 113.75 36.8314 113.75 35.5538V21.5565C113.75 20.2777 112.713 19.2434 111.437 19.2434"
          fill="#E51236"
        />
        <path
          d="M99.997 39.0001C89.3917 39.0001 80.7658 30.2762 80.7658 19.5501C80.7658 8.82398 89.3914 0.105637 99.997 0.105637C104.172 0.105637 108.145 1.43788 111.487 3.96051C112.505 4.72924 112.706 6.18107 111.94 7.1993C111.171 8.21822 109.721 8.42297 108.7 7.65172C106.167 5.74127 103.158 4.73084 99.9972 4.73084C91.944 4.73084 85.3898 11.3794 85.3898 19.5501C85.3898 27.7208 91.944 34.3753 99.9972 34.3753C101.016 34.3753 102.043 34.2665 103.046 34.0519C104.302 33.7737 105.525 34.5796 105.792 35.8294C106.059 37.0786 105.264 38.3064 104.012 38.574C102.694 38.8573 101.341 39.0001 99.9972 39.0001"
          fill="#E51236"
        />
        <path
          d="M18.7641 37.7665C17.487 37.7665 16.4519 36.7318 16.4519 35.4537V21.641C16.4519 20.364 17.487 19.3293 18.7641 19.3293C20.0412 19.3293 21.0773 20.364 21.0773 21.641V35.4537C21.0773 36.7318 20.0415 37.7665 18.7641 37.7665Z"
          fill="#E51236"
        />
        <path
          d="M23.5955 15.6434C22.9328 15.6434 22.2747 15.359 21.818 14.811C20.9997 13.8275 21.1347 12.3713 22.1157 11.5534L33.9692 1.68946C34.95 0.871844 36.4072 1.00406 37.2244 1.98809C38.0424 2.9696 37.9083 4.42625 36.9267 5.24272L25.0741 15.109C24.6416 15.4675 24.1176 15.6434 23.5955 15.6434Z"
          fill="#E51236"
        />
        <path
          d="M14.1722 15.6434C13.6502 15.6434 13.1267 15.4675 12.6945 15.109L0.833642 5.24272C-0.147819 4.42855 -0.282093 2.96937 0.534337 1.98809C1.35054 1.00659 2.80988 0.871846 3.79157 1.68946L15.6524 11.5534C16.6332 12.369 16.7682 13.8275 15.9517 14.811C15.494 15.359 14.8351 15.6434 14.1722 15.6434Z"
          fill="#E51236"
        />
        <path
          d="M149.908 33.7791C152.34 31.914 155.129 29.7762 157.404 27.2246C160.262 24.0213 162.461 20.0228 162.461 14.7732C162.461 9.41087 159.413 4.74557 154.99 2.73179C150.858 0.850779 145.809 1.39612 141.305 5.26252C136.802 1.39592 131.752 0.85103 127.62 2.73177C123.199 4.74552 120.148 9.41081 120.148 14.7732C120.148 17.9944 120.979 20.7645 122.306 23.1809C122.422 23.3915 122.578 23.5773 122.766 23.7277C122.953 23.878 123.169 23.99 123.4 24.0573C123.631 24.1246 123.873 24.1459 124.112 24.1202C124.351 24.0943 124.583 24.0219 124.794 23.9068C125.005 23.7918 125.192 23.6363 125.343 23.4494C125.494 23.2624 125.607 23.0475 125.674 22.817C125.742 22.5865 125.764 22.3449 125.738 22.1061C125.726 21.9972 125.704 21.8898 125.673 21.7852L125.711 21.7648L125.546 21.4689C125.539 21.4543 125.531 21.4397 125.523 21.4253L125.404 21.2094C124.349 19.2296 123.803 17.019 123.816 14.7754V14.7732C123.816 10.7819 126.081 7.45147 129.144 6.05611C132.093 4.71378 136.107 5.03316 139.985 9.04388C140.156 9.22068 140.361 9.36141 140.588 9.45737C140.815 9.55332 141.059 9.60275 141.305 9.60275C141.551 9.60275 141.795 9.55332 142.022 9.45737C142.248 9.36141 142.454 9.22087 142.625 9.04406C146.502 5.0351 150.517 4.71384 153.466 6.05611C156.529 7.4515 158.794 10.78 158.794 14.7732C158.794 18.8812 157.109 22.051 154.663 24.7964C152.636 27.0683 150.186 28.9489 147.764 30.8086C147.186 31.2523 146.61 31.6948 146.041 32.1413C145.021 32.9426 144.136 33.6255 143.288 34.1176C142.438 34.6103 141.806 34.8063 141.305 34.8063C140.803 34.8063 140.169 34.6119 139.323 34.1182L139.322 34.1176C138.474 33.6255 137.589 32.9426 136.569 32.1413L136.569 32.1409C135.809 31.5451 135.335 31.1277 134.852 30.6954C134.81 30.6574 134.767 30.6192 134.724 30.5808C134.277 30.1803 133.799 29.7517 133.069 29.1537C132.693 28.8457 132.21 28.6993 131.726 28.7462C131.242 28.7932 130.796 29.0297 130.486 29.4044C130.177 29.7791 130.029 30.2612 130.076 30.7446C130.124 31.2281 130.362 31.6726 130.738 31.9806C131.476 32.5847 131.981 33.0334 132.456 33.4563C132.493 33.4892 132.53 33.5221 132.567 33.5547C133.078 34.0084 133.573 34.4426 134.299 35.0125L134.299 35.0128C135.287 35.7874 136.37 36.6313 137.473 37.2742C138.576 37.9171 139.875 38.4615 141.305 38.4615C142.735 38.4615 144.034 37.9149 145.137 37.2745L145.137 37.2742C146.242 36.6313 147.323 35.7871 148.311 35.0128L148.311 35.0125C148.818 34.6146 149.354 34.2038 149.908 33.7791Z"
          fill="#E51236"
          stroke="#E51236"
          stroke-width="0.5"
        />
        <path
          d="M72.1794 37.8342C71.5877 37.8342 70.9955 37.6088 70.5445 37.1568L63.5771 30.1846C62.6765 29.2818 62.6765 27.8155 63.5804 26.9155C64.4833 26.0115 65.9466 26.0115 66.8495 26.9155L73.8166 33.8865C74.7173 34.7902 74.7173 36.2565 73.8139 37.1568C73.3619 37.6088 72.7711 37.8342 72.1794 37.8342Z"
          fill="#E51236"
        />
      </svg>
      <nav>
        <a href="#">Info</a>
        <a href="#">Swajp</a>
        <a href="#">Favoriter</a>
        <a href="#">Profil</a>
      </nav>
    </header>
  );
};

export default Header;
