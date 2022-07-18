import ClipLoader from "react-spinners/ClipLoader";

const Loading = ({loading}) => {
  return (
    <div className={loading ? "w-full h-full flex justify-center items-center" : "hidden"}>
      <ClipLoader loading={loading} size={150} />
    </div>
  )
};

export default Loading;
