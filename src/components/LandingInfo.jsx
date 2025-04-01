import React from "react";
import "./LandingInfo.css";

const LandingInfo = () => {
  return (
    <div className="landing-info">
      <div className="landing-info-content">
        <div className="landing-info-info">
          <h4 className="info-heading">Tid:</h4>
          <p className="info-text">13:00 - 15:00</p>
          <h4 className="info-heading">Plats:</h4>
          <p className="info-text">Visual Arena</p>
          <h4 className="info-heading">Adress:</h4>
          <p className="info-text" id="adress">
            Lindholmspiren 3
          </p>
          <p className="info-text">417 55 Göteborg</p>
        </div>

        <div className="landing-info-icons">
          <svg
            id="landing-info-icon-1"
            xmlns="http://www.w3.org/2000/svg"
            width="146"
            height="66"
            viewBox="0 0 146 66"
            fill="none"
          >
            <path
              d="M7.86262 58.0722C5.83246 58.0722 4.09233 57.3848 2.64221 56.0098C1.1921 54.6133 0.478198 52.9375 0.500507 50.9824C0.478198 49.0488 1.1921 47.3945 2.64221 46.0195C4.09233 44.6446 5.83246 43.9571 7.86262 43.9571C9.82587 43.9571 11.5325 44.6446 12.9827 46.0195C14.4551 47.3945 15.2024 49.0488 15.2248 50.9824C15.2024 52.293 14.8455 53.4853 14.1538 54.5596C13.4846 55.6338 12.5922 56.4932 11.4767 57.1377C10.3836 57.7607 9.17887 58.0722 7.86262 58.0722ZM7.86262 25.3623C5.83246 25.3623 4.09233 24.6748 2.64221 23.2998C1.1921 21.9033 0.478198 20.2275 0.500507 18.2725C0.478198 16.3389 1.1921 14.6846 2.64221 13.3096C4.09233 11.9131 5.83246 11.2148 7.86262 11.2148C9.82587 11.2148 11.5325 11.9131 12.9827 13.3096C14.4551 14.6846 15.2024 16.3389 15.2248 18.2725C15.2024 19.5615 14.8455 20.7431 14.1538 21.8174C13.4846 22.8916 12.5922 23.751 11.4767 24.3955C10.3836 25.0401 9.17887 25.3623 7.86262 25.3623ZM47.7221 66H24.498V0H48.1906C54.995 0 60.8401 1.32129 65.7258 3.96387C70.6339 6.58496 74.4042 10.3555 77.0367 15.2754C79.669 20.1953 80.9851 26.082 80.9851 32.9355C80.9851 39.8105 79.658 45.7187 77.0032 50.6601C74.3707 55.6016 70.567 59.3935 65.592 62.0361C60.6393 64.6787 54.6826 66 47.7221 66ZM36.9132 55.6553H47.1198C51.894 55.6553 55.8762 54.8174 59.0664 53.1416C62.2567 51.4443 64.655 48.9199 66.2613 45.5684C67.8675 42.1953 68.6706 37.9843 68.6706 32.9355C68.6706 27.8867 67.8675 23.6973 66.2613 20.3672C64.655 17.0156 62.279 14.5127 59.1334 12.8584C56.0101 11.1826 52.1282 10.3447 47.4878 10.3447H36.9132V55.6553ZM112.237 66H89.0124V0H112.705C119.509 0 125.354 1.32129 130.24 3.96387C135.148 6.58496 138.918 10.3555 141.551 15.2754C144.183 20.1953 145.5 26.082 145.5 32.9355C145.5 39.8105 144.172 45.7187 141.518 50.6601C138.885 55.6016 135.082 59.3935 130.106 62.0361C125.153 64.6787 119.197 66 112.237 66ZM101.427 55.6553H111.634C116.408 55.6553 120.39 54.8174 123.581 53.1416C126.771 51.4443 129.169 48.9199 130.776 45.5684C132.382 42.1953 133.185 37.9843 133.185 32.9355C133.185 27.8867 132.382 23.6973 130.776 20.3672C129.169 17.0156 126.794 14.5127 123.648 12.8584C120.525 11.1826 116.642 10.3447 112.002 10.3447H101.427V55.6553Z"
              fill="#E51236"
            />
          </svg>
          <svg
            id="landing-info-icon-2"
            xmlns="http://www.w3.org/2000/svg"
            width="180"
            height="180"
            viewBox="0 0 180 180"
            fill="none"
          >
            <path
              d="M116.023 131.367C123.383 125.738 131.818 119.286 138.7 111.584C147.346 101.916 154 89.8473 154 74.0025C154 57.8178 144.777 43.7367 131.398 37.6586C118.897 31.9812 103.627 33.6272 89.9988 45.297C76.379 33.6266 61.1009 31.9819 48.6013 37.6585C35.229 43.7365 26 57.8176 26 74.0025C26 83.7251 28.5124 92.086 32.5267 99.3792C32.8768 100.015 33.3495 100.576 33.9173 101.03C34.485 101.483 35.1369 101.821 35.8355 102.024C36.5342 102.228 37.2662 102.292 37.9898 102.214C38.7135 102.136 39.4148 101.918 40.0537 101.57C40.6926 101.223 41.2569 100.754 41.7138 100.19C42.1709 99.6253 42.5118 98.9767 42.7168 98.2809C42.9218 97.5852 42.987 96.8561 42.9083 96.1352C42.8724 95.8064 42.807 95.4824 42.7133 95.1668L42.827 95.1051L42.3291 94.2121C42.3063 94.1678 42.2828 94.1239 42.2588 94.0803L41.9 93.4289C38.7085 87.4531 37.0558 80.7811 37.0951 74.0092V74.0025C37.0951 61.9557 43.9463 51.9038 53.2131 47.6922C62.1338 43.6407 74.2771 44.6047 86.007 56.7101C86.5247 57.2437 87.1457 57.6685 87.8316 57.9581C88.5175 58.2477 89.255 58.3969 90 58.3969C90.745 58.3969 91.4824 58.2477 92.1684 57.9581C92.8543 57.6685 93.4747 57.2443 93.9925 56.7107C105.723 44.6106 117.867 43.6409 126.787 47.6922C136.054 51.9039 142.904 61.9501 142.904 74.0025C142.904 86.4015 137.81 95.9689 130.41 104.255C124.277 111.112 116.867 116.789 109.539 122.402C107.791 123.741 106.048 125.076 104.327 126.424C101.241 128.843 98.5632 130.904 95.9978 132.389C93.4289 133.876 91.5172 134.468 90 134.468C88.4814 134.468 86.5635 133.881 84.0049 132.391L84.0022 132.389C81.4368 130.904 78.7589 128.843 75.6731 126.424L75.6724 126.423C73.3738 124.625 71.9413 123.365 70.4797 122.06C70.3511 121.945 70.2223 121.83 70.0925 121.714C68.74 120.505 67.2927 119.212 65.0856 117.407C63.948 116.477 62.486 116.035 61.0217 116.177C59.5575 116.319 58.2086 117.033 57.2725 118.163C56.3362 119.294 55.8898 120.749 56.0329 122.209C56.1761 123.668 56.8967 125.009 58.0344 125.939C60.2657 127.762 61.7933 129.117 63.2325 130.393C63.3448 130.492 63.4566 130.592 63.5682 130.69C65.1136 132.059 66.6094 133.37 68.8056 135.09L68.8061 135.091C71.7949 137.429 75.0714 139.976 78.4076 141.916C81.7457 143.857 85.6731 145.5 90 145.5C94.3275 145.5 98.255 143.85 101.591 141.917L101.592 141.916C104.934 139.976 108.206 137.428 111.194 135.091L111.195 135.09C112.728 133.889 114.348 132.649 116.023 131.367Z"
              fill="#E51236"
              stroke="#E51236"
              stroke-width="2.5"
            />
          </svg>
          <svg
            id="landing-info-icon-3"
            xmlns="http://www.w3.org/2000/svg"
            width="146"
            height="66"
            viewBox="0 0 146 66"
            fill="none"
          >
            <path
              d="M18.9945 65.0159L0.5 0H13.267L25.074 47.7778H25.682L38.2891 0H49.9041L62.5431 47.8095H63.119L74.9262 0H87.6932L69.1986 65.0159H57.4875L44.3685 19.3968H43.8566L30.7056 65.0159H18.9945ZM133.629 0H145.5V42.4762C145.5 47.1323 144.391 51.2275 142.172 54.7619C139.975 58.2963 136.882 61.0582 132.893 63.0477C128.904 65.0159 124.243 66 118.91 66C113.556 66 108.884 65.0159 104.895 63.0477C100.906 61.0582 97.8135 58.2963 95.6157 54.7619C93.4186 51.2275 92.3201 47.1323 92.3201 42.4762V0H104.191V41.4921C104.191 44.2011 104.788 46.6138 105.983 48.7302C107.199 50.8466 108.905 52.5079 111.102 53.7143C113.3 54.8995 115.903 55.4921 118.91 55.4921C121.918 55.4921 124.521 54.8995 126.718 53.7143C128.936 52.5079 130.642 50.8466 131.837 48.7302C133.032 46.6138 133.629 44.2011 133.629 41.4921V0Z"
              fill="#E51236"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LandingInfo;
