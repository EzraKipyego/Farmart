import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AlertCircle, Loader2, ChevronLeft, Upload, Link as LinkIcon } from 'lucide-react'
import { addAnimal, editAnimal, loadAnimalDetail } from '../features/animals/animalsSlice'
import { animalTypes, breedsByType } from '../data/mockAnimals'
import AnimalImage from '../components/common/AnimalImage'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

const emptyForm = {
  type: 'Cattle',
  breed: '',
  title: '',
  age: '',
  ageUnit: 'years',
  weight: '',
  price: '',
  location: '',
  description: '',
  image: '',
}

function AddEditAnimalPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { selectedAnimal, detailStatus, error } = useSelector((state) => state.animals)

  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [imageError, setImageError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [appliedId, setAppliedId] = useState(null)

  useEffect(() => {
    if (isEdit) {
      dispatch(loadAnimalDetail(id))
    }
  }, [dispatch, id, isEdit])

  const loadedAnimal = isEdit && selectedAnimal && selectedAnimal.id === id ? selectedAnimal : null
  const listingNotFound = isEdit && detailStatus === 'failed' && error?.status === 404

  if (loadedAnimal && appliedId !== loadedAnimal.id) {
    setAppliedId(loadedAnimal.id)
    setForm({
      type: loadedAnimal.type,
      breed: loadedAnimal.breed,
      title: loadedAnimal.title,
      age: loadedAnimal.age,
      ageUnit: loadedAnimal.ageUnit,
      weight: loadedAnimal.weight,
      price: loadedAnimal.price,
      location: loadedAnimal.location,
      description: loadedAnimal.description || '',
      image: loadedAnimal.image || '',
    })
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value, ...(field === 'type' ? { breed: '' } : {}) }))
  }

  function handleImageUrlChange(value) {
    setImageError(null)
    handleChange('image', value)
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImageError(null)

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Please choose a PNG, JPG, or WEBP image.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image is too large. Please choose a file under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      handleChange('image', reader.result)
    }
    reader.onerror = () => {
      console.error('[AddEditAnimalPage] failed to read image file')
      setImageError('Could not read that image. Try a different file.')
    }
    reader.readAsDataURL(file)
  }

  function validate() {
    if (!form.title.trim()) return 'Give this listing a title.'
    if (!form.breed) return 'Select a breed.'
    if (!form.age || Number(form.age) <= 0) return 'Enter a valid age.'
    if (!form.weight || Number(form.weight) <= 0) return 'Enter a valid weight.'
    if (!form.price || Number(form.price) <= 0) return 'Enter a valid price.'
    if (!form.location.trim()) return 'Enter the location.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = {
      ...form,
      age: Number(form.age),
      weight: Number(form.weight),
      price: Number(form.price),
      farmerId: user?.id,
      farmerName: user?.name,
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await dispatch(editAnimal({ id, payload })).unwrap()
      } else {
        await dispatch(addAnimal(payload)).unwrap()
      }
      navigate('/farmer/listings')
    } catch (err) {
      console.error(`[AddEditAnimalPage] ${isEdit ? 'update' : 'create'} failed:`, err)
      setFormError(err || 'Something went wrong saving this listing.')
    } finally {
      setSubmitting(false)
    }
  }

  const breeds = breedsByType[form.type] || []

  if (isEdit && detailStatus === 'loading') {
    return <p className="text-center text-sm text-[#8b95a1] py-12">Loading listing…</p>
  }

  if (listingNotFound) {
    return (
      <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-lg mx-auto text-center">
        <p className="text-sm text-[#f87171] mb-4">This listing no longer exists.</p>
        <Link to="/farmer/listings" className="text-sm text-[#2dd4a7] hover:underline">
          Back to listings
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 pt-4 pb-24 sm:pb-10 max-w-lg mx-auto">
      <Link to="/farmer/listings" className="flex items-center gap-1 text-sm text-[#8b95a1] mb-4 outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] rounded-md w-fit">
        <ChevronLeft size={16} aria-hidden="true" />
        Back to listings
      </Link>

      <h1 className="text-base font-medium text-[#f5f5f0] mb-5">{isEdit ? 'Edit listing' : 'Add a new listing'}</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <p className="text-xs text-[#8b95a1] mb-1.5">Photo</p>
          <div className="flex items-center gap-3 mb-3">
            <AnimalImage
              type={form.type}
              src={form.image}
              size={22}
              className="w-16 h-16 rounded-lg shrink-0 border border-[#1f2937]"
            />
            <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-[#2a323d] rounded-lg py-3 text-xs text-[#8b95a1] cursor-pointer hover:border-[#2dd4a7] hover:text-[#2dd4a7]">
              <Upload size={14} aria-hidden="true" />
              Upload photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <LinkIcon size={14} className="text-[#5f6b7a] shrink-0" aria-hidden="true" />
            <input
              type="url"
              value={form.image.startsWith('data:') ? '' : form.image}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="Or paste an image link"
              className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>
          {imageError && <p className="text-xs text-[#f87171] mt-2">{imageError}</p>}
        </div>

        <div>
          <label htmlFor="type" className="text-xs text-[#8b95a1] block mb-1.5">
            Animal type
          </label>
          <select
            id="type"
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            {animalTypes.filter((t) => t !== 'All animals').map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="breed" className="text-xs text-[#8b95a1] block mb-1.5">
            Breed
          </label>
          <select
            id="breed"
            value={form.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          >
            <option value="">Select breed</option>
            {breeds.map((breed) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="text-xs text-[#8b95a1] block mb-1.5">
            Listing title
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="age" className="text-xs text-[#8b95a1] block mb-1.5">
              Age (years)
            </label>
            <input
              id="age"
              type="number"
              min="0"
              step="0.1"
              value={form.age}
              onChange={(e) => handleChange('age', e.target.value)}
              className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>
          <div>
            <label htmlFor="weight" className="text-xs text-[#8b95a1] block mb-1.5">
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              min="0"
              value={form.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="price" className="text-xs text-[#8b95a1] block mb-1.5">
            Price (KSh)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          />
        </div>

        <div>
          <label htmlFor="location" className="text-xs text-[#8b95a1] block mb-1.5">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-xs text-[#8b95a1] block mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full bg-[#161b22] border border-[#1f2937] rounded-lg px-3 py-2.5 text-sm text-[#f5f5f0] placeholder:text-[#5f6b7a] outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] resize-none"
          />
        </div>

        {formError && (
          <div className="flex items-start gap-2 bg-[#f87171]/10 text-[#f87171] text-xs rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-[#2dd4a7] text-[#04342c] font-medium text-sm py-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4a7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:opacity-60"
        >
          {submitting && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          {isEdit ? 'Save changes' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}

export default AddEditAnimalPage