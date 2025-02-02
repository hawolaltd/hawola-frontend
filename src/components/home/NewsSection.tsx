import Slider from "react-slick";

const news = [
    {
        category: "Technology",
        title: "The latest technologies to be used for VR in 2022",
        date: "September 02, 2022",
        readTime: "5 Mins read",
        image: "/imgs/page/blog/blog-1.jpg",
    },
    {
        category: "Technology",
        title: "How can Web 3.0 Bring Changes to the Gaming?",
        date: "August 30, 2022",
        readTime: "5 Mins read",
        image: "/imgs/page/blog/blog-2.jpg",
    },
    {
        category: "Gaming",
        title: "NFT Blockchain Games That Might Take Off",
        date: "August 28, 2022",
        readTime: "3 Mins read",
        image: "/imgs/page/blog/blog-3.jpg",
    },
    {
        category: "Blockchain",
        title: "Blockchain Gaming And Its Three Challenges",
        date: "August 15, 2022",
        readTime: "7 Mins read",
        image: "/imgs/page/blog/blog-4.jpg",
    }, {
        category: "Blockchain",
        title: "Blockchain Gaming And Its Three Challenges",
        date: "August 15, 2022",
        readTime: "7 Mins read",
        image: "/imgs/page/blog/blog-5.jpg",
    }, {
        category: "Blockchain",
        title: "Blockchain Gaming And Its Three Challenges",
        date: "August 15, 2022",
        readTime: "7 Mins read",
        image: "/imgs/page/blog/blog-6.jpg",
    },
];

const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                infinite: true,
                dots: false
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                initialSlide: 2
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};

const NewsSection = () => {
    return (
        <div className="container mx-auto px-4 py-5">
            <div className="flex flex-col mx-auto text-left mb-8 w-full border-b border-b-[#CAD6EC] pb-4">
                <h2 className="text-xl font-bold text-primary">Latest News & Events</h2>
                <p className="text-xs text-textPadded">From our blog forum</p>
            </div>

                <div className="grid md:grid-cols-1 gap-6 mt-6">
                    <Slider {...settings} className={'w-full'}>
                            {news.map((item, index) => (
                                <div key={index} className={'p-2'}>
                                    <div key={index} className="rounded overflow-hidden">
                                        <img src={item.image} alt={item.title} className="w-full h-40 object-cover"/>
                                        <div className="p-4">
                                        <span
                                            className="flex items-center gap-1 text-[10px] text-primary bg-[#D5DFE4] py-1 px-2 w-fit rounded"> <p
                                            className={'bg-[#36A2D0] rounded-full w-1 h-1'}></p> {item.category}</span>
                                            <h3 className="text-lg text-[#253D4E] font-bold">{item.title}</h3>
                                            <p className="text-[10px] mt-4 text-textPadded">{item.date} • {item.readTime}</p>
                                        </div>
                                    </div>
                                </div>
                                    ))}

                                </Slider>
                                </div>
        </div>
);
            };

            export default NewsSection;
