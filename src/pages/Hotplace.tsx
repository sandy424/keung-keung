import Bottombar from "../components/Bottombar";

export default function Hotplace() {
    return(
        <div className="relative mx-auto w-full max-w-175 min-h-[calc(100vh-5rem)]">
            <div className="flex flex-col gap-6 items-center pt-48">
                <img src="/dessert1.png" alt="dessert" width={200} height={200}/>
                <p className="font-bold text-xl text-amber-950">아직 미개발입니다</p>
            </div>
            <Bottombar />
        </div>
    )
}