import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

import './SuccessPage.css';

const SuccessPage = () => {
  const { width, height } = useWindowSize();

  return (
    <div className="success-page">
      <div className="success-checkmark">
        <div className="check-icon">
          <span className="icon-line line-tip"></span>
          <span className="icon-line line-long"></span>
          <div className="icon-circle"></div>
          <div className="icon-fix"></div>
        </div>
      </div>
      <p>Payment successful!</p>
      <Confetti
        width={width}
        height={height}
      />
    </div>
  );
}

export default SuccessPage;
