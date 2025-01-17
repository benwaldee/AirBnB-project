import './SpotIDPage.css'
import { useParams, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { getAllSpotsThunk, getSpotByIDThunk } from '../../store/spots'
import { getReviewsBySpotIDThunk, addReviewThunk, editReviewThunk, deleteReviewThunk } from '../../store/reviews'
import { Modal, useModalContext } from '../../context/Modal';
import star from './star.PNG'
import exclImg from '../LoginFormModal/excl.PNG'
import LoginForm from '../LoginFormModal/LoginForm';
import Review from '../ReviewModal/Review'
import Book from '../Book/Book'
import { getUserBookingsThunk } from "../../store/bookings"


const SpotIDPage = () => {
    const [stars, setStars] = useState(0)
    const [reviewMessage, setReviewMessage] = useState('')
    const [starsEdit, setStarsEdit] = useState(5)

    const [reviewMessageEdit, setReviewMessageEdit] = useState('')
    const [showAddReview, setShowAddReview] = useState(false)

    const [errors, setErrors] = useState([]);
    const [showEdit, setShowEdit] = useState(false)
    const [toggle, setToggle] = useState(false)
    const [charCount, setCharCount] = useState(0)
    const [charCountEdit, setCharCountEdit] = useState(0)
    const [toggleRender, setToggleRender] = useState(false)


    const { showLoginFormSpotCard, setShowLoginFormSpotCard, showReviewModal, setShowReviewModal, searchToggle, booked, setBooked } = useModalContext();


    const history = useHistory()


    let { spotID } = useParams()
    spotID = Number(spotID)

    // console.log(spotID)

    const dispatch = useDispatch()


    const sessionUser = useSelector((state) => state.session.user)
    const allSpots = useSelector((state) => state.spots.allSpots)

    useEffect(() => {
        setShowAddReview(false)
        setShowEdit(false)

    }, [sessionUser])





    useEffect(() => {
        dispatch(getSpotByIDThunk(spotID))
            .catch(async (res) => {
                if (!res.ok) {
                    history.push('/404')
                }
            }
            )
        dispatch(getReviewsBySpotIDThunk(spotID))
            .catch(async (res) => {
                if (!res.ok) {
                    history.push('/404')
                }
            }
            )

        if (sessionUser) {
            dispatch(getUserBookingsThunk())
                .then(() => setLoaded(true))
        }
    }, [showAddReview, showEdit, toggle, searchToggle, sessionUser])


    const [loaded, setLoaded] = useState(false)



    useEffect(() => {
        dispatch(getSpotByIDThunk(spotID))
            .catch(async (res) => {
                if (!res.ok) {
                    history.push('/404')
                }
            }
            )
        dispatch(getReviewsBySpotIDThunk(spotID))
            .catch(async (res) => {
                if (!res.ok) {
                    history.push('/404')
                }
            }
            )

        if (sessionUser) {
            dispatch(getUserBookingsThunk())
                .then(() => setLoaded(true))
        } else { setLoaded(true) }
    }, [])




    let userBooking = Object.values(useSelector(state => state?.bookings?.userBookings))
        .filter(booking => Number(booking.spotId) === spotID)[0]

    // console.log("users booking", userBooking)

    useEffect(() => {



        //four scenarios

        //no booking - should be able to book
        //booking in the past - should be able to book
        //booking in the future - should be able to edit or delete booking
        //bookin in the present - should know they have a booking

        //user cannot make multiple bookings for the same spot. prevent users from hogging a place


        if (userBooking) {
            const today = new Date();
            let formattedToday = today.toISOString().slice(0, 10).split("-").join("")
            //booking in future
            //if there is a booking, and it starts in the future, we would say we are booked
            if (Number(userBooking.startDate.split("-").join("")) > Number(formattedToday)) {
                setBooked("future")
            }

            //booking in present
            //if there is a booking, and the start date is in the past, but the end date is in the future, we are currently staying

            if (Number(userBooking.startDate.split("-").join("")) < Number(formattedToday) &&
                Number(userBooking.endDate.split("-").join("")) > Number(formattedToday)) {
                setBooked("present")
            }


            //booking in past
            if (Number(userBooking.endDate.split("-").join("")) < Number(formattedToday)) {
                setBooked("past/none")
            }
            //no booking
        } else { setBooked("past/none") }

        //no user? prompt a login

        if (!sessionUser) {
            setBooked('login')
        }

    }, [loaded, sessionUser])






    const oneSpot = useSelector((state) => state.spots?.oneSpot)
    const revObj = useSelector((state => {
        if (oneSpot) { return state.reviews?.oneSpotReviews }
        else return
    }
    ))
    let revArr;

    if (revObj) {

        revArr = Object.values(revObj)
    }


    const handleSubmit = (e) => {

        e.preventDefault()

        if (!sessionUser) {
            alert('Please log in to leave a review')
            setReviewMessage('')
            setStars(0)
            setShowAddReview(false)
            setCharCount(0)
            setStars(0)
            setErrors([])
            return
        }

        let errArrS = []
        setErrors([])

        if (reviewMessage.length < 20) {
            errArrS.push('Review must be at least 20 characters')

        }

        if (stars < 1) {
            errArrS.push('Please provide a rating')

        }

        const addRev = {
            userId: sessionUser.id,
            spotId: spotID,
            stars,
            review: reviewMessage

        }

        if (errArrS.length > 0) {

            setErrors(errArrS)
            return
        }
        if (errArrS.length === 0) {
            dispatch(addReviewThunk(addRev))

            setReviewMessage('')
            setStars(0)
            setShowAddReview(false)
            setCharCount(0)
            setStars(0)
            setErrors([])

            dispatch(getSpotByIDThunk(spotID))
            dispatch(getReviewsBySpotIDThunk(spotID))
        }
    }

    const handleEditSubmit = (e, revId) => {

        e.preventDefault()

        if (!sessionUser) {
            alert('Please log in to edit reviews')
            setReviewMessageEdit(reviewMessageEdit)
            setStarsEdit(starsEdit)
            setShowEdit(false)
            setStars(0)
            setCharCountEdit(0)
            setErrors([])
            return
        }

        let errArrSE = []
        setErrors([])

        if (reviewMessageEdit.length < 20) {
            errArrSE.push('Review must be at least 20 characters')

        }

        if (stars < 1) {
            errArrSE.push('Please provide a rating')

        }

        const editRev = {
            userId: sessionUser.id,
            spotId: spotID,
            stars: stars,
            review: reviewMessageEdit,
            revId
        }
        if (errArrSE.length > 0) {
            setErrors(errArrSE)
            return
        }
        if (errArrSE.length === 0) {
            dispatch(editReviewThunk(editRev))

            setReviewMessageEdit(reviewMessageEdit)
            setStarsEdit(starsEdit)
            setShowEdit(false)
            setStars(0)
            setCharCountEdit(0)
            setErrors([])

            dispatch(getSpotByIDThunk(spotID))
            dispatch(getReviewsBySpotIDThunk(spotID))
            return
        }
    }

    const addReview = () => {
        if (!sessionUser) {
            // alert('login first')
            // alert('Please log in to leave a review')
            setShowAddReview(false)
            setShowLoginFormSpotCard(true)
            return
        }

        for (let rev of revArr) {
            if (rev.userId === sessionUser.id) {
                setShowReviewModal(true)
                return
            }
        }
        setShowAddReview(!showAddReview)



    }

    const showEditFunc = (review) => {

        // console.log(review)
        if (!sessionUser) {
            // alert('Please log in to edit reviews')
            setShowAddReview(false)
            setShowLoginFormSpotCard(true)
            return
        }

        setShowEdit(!showEdit)
        setStarsEdit(review.stars)
        setReviewMessageEdit(review.review)
        setCharCountEdit(review.review.length)

    }

    const deleteReviewFunc = (revId) => {

        // console.log('delete click')
        setShowEdit(false)

        dispatch(deleteReviewThunk(revId))

        setToggle(!toggle)

        dispatch(getSpotByIDThunk(spotID))
        dispatch(getReviewsBySpotIDThunk(spotID))
    }

    const starCount = (num) => {

        setStars(num)

    }


    if (oneSpot && revArr) {
        return (
            <>
                <div className='spotIDOuterDiv'>
                    {!sessionUser && showLoginFormSpotCard && (
                        <Modal onClose={() => {
                            setShowLoginFormSpotCard(false)

                        }}>
                            <LoginForm />
                        </Modal>
                    )}
                    <div className='spotIDInnerDiv'>
                        <div className='spotIDTitle'> {oneSpot?.name}</div>
                        <div className='subtitleDiv'>
                            <img className='spotIDPageStar' src={star}></img>
                            <div className='siRating'>{oneSpot?.avgStarRating}</div>
                            <div className='dot'>·</div>
                            <div className='siNum' >{oneSpot?.numReviews} reviews</div>
                            <div className='period'>.</div>
                            <div className='siLoc'>{oneSpot?.city}, {oneSpot?.state}, {oneSpot?.country} </div>

                        </div>
                        <img className='spotIDImage' src={oneSpot?.Images[oneSpot.Images.length - 1]?.url} />
                        <div className='siHost'>Mobile listing hosted by {oneSpot?.Owner.firstName}</div>
                        <div className='cleanLine'></div>
                        <p>{oneSpot?.description}</p>
                        <div className='cleanLine'></div>
                        <div className='SpotIDPage_lowWrap'>
                            <div className='reviewDiv'>
                                <div className='reviewsTitle'>Reviews</div>
                                <div className='addReview' onClick={addReview}> Add a review</div>
                                {showAddReview && sessionUser && <div className='addReviewForm'>

                                    <form className='formAddReview' onSubmit={handleSubmit}>
                                        <div className='errorDivAddSpot'>

                                            {errors.map((error, idx) => {
                                                return (
                                                    <div key={error} className='alignAddSpot'>
                                                        <span>
                                                            <img id='errorImgLogin' src={exclImg}></img>
                                                        </span>
                                                        <div className='oneErrorDivLogin' key={idx}>{error}</div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <textarea
                                            id='addReviewMessage'
                                            placeholder='Write review here!'
                                            maxLength='250'

                                            required
                                            value={reviewMessage}
                                            onChange={(e) => {
                                                setReviewMessage(e.target.value)
                                                setCharCount(e.target.value.length)
                                            }}
                                        />
                                        <div className='charCountReview'>{charCount}/500</div>


                                        <div className='starDiv'>
                                            {stars < 1 && <i id='noStar1' onClick={() => starCount(1)} className="fa-regular fa-star"></i>}
                                            {stars > 0 && <i id='star1' onClick={() => starCount(1)} className="fa-solid fa-star"></i>}
                                            {stars < 2 && <i id='noStar2' onClick={() => starCount(2)} className="fa-regular fa-star"></i>}
                                            {stars > 1 && <i id='star2' onClick={() => starCount(1)} className="fa-solid fa-star"></i>}
                                            {stars < 3 && <i id='noStar3' onClick={() => starCount(3)} className="fa-regular fa-star"></i>}
                                            {stars > 2 && <i id='star3' onClick={() => starCount(2)} className="fa-solid fa-star"></i>}
                                            {stars < 4 && <i id='noStar4' onClick={() => starCount(4)} className="fa-regular fa-star"></i>}
                                            {stars > 3 && <i id='star4' onClick={() => starCount(3)} className="fa-solid fa-star"></i>}
                                            {stars < 5 && <i id='noStar5' onClick={() => starCount(5)} className="fa-regular fa-star"></i>}
                                            {stars > 4 && <i id='star5' onClick={() => starCount(4)} className="fa-solid fa-star"></i>}

                                        </div>




                                        <button className='addRevSubmit'>Leave review</button>
                                    </form>

                                </div>}



                                {revArr?.map((review) => {
                                    return (
                                        <div className='reviewCardOuter' key={review.id}>
                                            <div className='nameDivRev'>
                                                <i class="fa-solid fa-circle-user"></i>
                                                {sessionUser?.id === review.userId && <div className='revName'> {sessionUser.firstName}</div>}
                                                {sessionUser?.id !== review.userId && <div className='revName'> {review.User?.firstName}</div>}
                                                {/* {!sessionUser && <div className='revName'> {review.User?.firstName}</div>} */}
                                            </div>
                                            <div className='revDate'> {review.createdAt.slice(0, 10)}</div>
                                            <div className='revCardStarsDiv'>
                                                <i id='cardStar' class="fa-solid fa-star"></i>
                                                <div className='revStars'>{review.stars}</div>
                                            </div>
                                            <div className='revText'>{review.review}</div>
                                            {sessionUser?.id === review.userId &&
                                                <div>
                                                    <button className='revEditButton' onClick={() => showEditFunc(review)}>Edit</button>
                                                    <button className='revDeleteButton' onClick={() => deleteReviewFunc(review.id)}>Delete</button>
                                                </div>
                                            }
                                            {sessionUser?.id === review.userId && showEdit && <div className='addReviewForm'>

                                                <form className='formAddReview' onSubmit={(e) => handleEditSubmit(e, review.id)}>
                                                    <div className='errorDivAddSpot'>

                                                        {errors.map((error, idx) => {
                                                            return (
                                                                <div className='alignAddSpot'>
                                                                    <span>
                                                                        <img id='errorImgLogin' src={exclImg}></img>
                                                                    </span>
                                                                    <div className='oneErrorDivLogin' key={idx}>{error}</div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <textarea
                                                        id='addReviewMessage'
                                                        placeholder='Edit review'
                                                        maxLength='250'

                                                        required
                                                        value={reviewMessageEdit}
                                                        onChange={(e) => {
                                                            setReviewMessageEdit(e.target.value)
                                                            setCharCountEdit(e.target.value.length)
                                                        }}
                                                    />
                                                    <div className='charCountReview'>{charCountEdit}/500</div>


                                                    <div className='starDiv'>
                                                        {stars < 1 && <i id='noStar1' onClick={() => starCount(1)} className="fa-regular fa-star"></i>}
                                                        {stars > 0 && <i id='star1' onClick={() => starCount(1)} className="fa-solid fa-star"></i>}
                                                        {stars < 2 && <i id='noStar2' onClick={() => starCount(2)} className="fa-regular fa-star"></i>}
                                                        {stars > 1 && <i id='star2' onClick={() => starCount(1)} className="fa-solid fa-star"></i>}
                                                        {stars < 3 && <i id='noStar3' onClick={() => starCount(3)} className="fa-regular fa-star"></i>}
                                                        {stars > 2 && <i id='star3' onClick={() => starCount(2)} className="fa-solid fa-star"></i>}
                                                        {stars < 4 && <i id='noStar4' onClick={() => starCount(4)} className="fa-regular fa-star"></i>}
                                                        {stars > 3 && <i id='star4' onClick={() => starCount(3)} className="fa-solid fa-star"></i>}
                                                        {stars < 5 && <i id='noStar5' onClick={() => starCount(5)} className="fa-regular fa-star"></i>}
                                                        {stars > 4 && <i id='star5' onClick={() => starCount(4)} className="fa-solid fa-star"></i>}

                                                    </div>




                                                    <button className='addRevSubmit'>Save</button>
                                                </form>

                                            </div>
                                            }
                                        </div>
                                    )
                                })}

                            </div>
                            <div className='SpotIDPage_bookCenter'>
                                {loaded && <Book userBooking={userBooking} booked={booked}
                                    setBooked={setBooked}
                                    setToggleRender={setToggleRender} toggleRender={toggleRender}
                                    spotID={spotID} sessionUser={sessionUser}
                                />}
                            </div>
                        </div>
                    </div>
                </div>
                {showReviewModal &&
                    <Modal onClose={() => {
                        setShowReviewModal(false)

                    }}>
                        <Review sessionUser={sessionUser} />
                    </Modal>
                }
            </>
        )
    } else {
        return (
            <div className="loading"></div>
        )
    }
}

export default SpotIDPage
