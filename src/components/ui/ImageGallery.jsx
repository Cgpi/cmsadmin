import { useState, useMemo, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Power, PowerOff, GripVertical, ImageIcon, AlertTriangle,
} from 'lucide-react'
import { Card } from './Card'
import Badge from './Badge'
import Button from './Button'
import Modal from './Modal'
import EmptyState from './EmptyState'
import UploadImageModal from '../admin/UploadImageModal'
import LocationFormModal from '../admin/LocationFormModal'
import { useToast } from './useToast'
import { fetchImages, createImage, updateImage, deleteImage, rememberInactiveImage } from '../../data/imageData'
import { createLocation, deleteLocation, fetchLocationById, fetchLocations, updateLocation } from '../../data/locationData'
import { cn } from '../../lib/utils'

export default function ImageGallery({ userId, allowCreate = true }) {
  const [images, setImages] = useState([])
  const [locations, setLocations] = useState([])
  const [locationError, setLocationError] = useState('')
  const [imageError, setImageError] = useState('')
  const [loadingLocationId, setLoadingLocationId] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [activeLocationsOnly, setActiveLocationsOnly] = useState(false)
  const [activeOnly, setActiveOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [uploadModal, setUploadModal] = useState({ open: false, mode: 'create', initial: null })
  const [locationModal, setLocationModal] = useState({ open: false, mode: 'create', initial: null })
  const [locationDeleteTarget, setLocationDeleteTarget] = useState(null)
  const [deletingLocation, setDeletingLocation] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const submitRef = useRef(false)

  useEffect(() => {
    let mounted = true
    fetchLocations({ userId, activeOnly: false })
      .then((data) => {
        if (mounted) {
          setLocations(data)
          setLocationError('')
        }
      })
      .catch((error) => {
        if (mounted) setLocationError(error.message || 'Unable to load active locations.')
      })
    return () => {
      mounted = false
    }
  }, [userId])

  useEffect(() => {
    if (!activeLocationsOnly || activeTab === 'All') return
    const selected = locations.find((location) => location.name === activeTab)
    if (selected && !selected.active) setActiveTab('All')
  }, [activeLocationsOnly, activeTab, locations])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setImageError('')
      try {
        const data = await fetchImages({
          activeOnly,
          locationOptions: locations,
          userId,
        })
        if (mounted) setImages(data)
      } catch (error) {
        if (mounted) {
          setImages([])
          setImageError(error.message || 'Unable to load images.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [activeOnly, locations, userId])

  const counts = useMemo(() => images.reduce((totals, image) => {
    if (image.locationId != null) {
      const id = String(image.locationId)
      totals[id] = (totals[id] || 0) + 1
    }
    return totals
  }, {}), [images])
  const selectedLocation = locations.find((location) => location.name === activeTab)
  const visibleLocations = activeLocationsOnly
    ? locations.filter((location) => location.active)
    : locations

  const filtered = useMemo(() => {
    const activeLocationIds = new Set(locations
      .filter((location) => location.active)
      .map((location) => String(location.id)))
    return images.map((image) => {
      const matchedLocation = locations.find((location) => (
        image.locationId != null && String(location.id) === String(image.locationId)
      ))
      return matchedLocation ? { ...image, location: matchedLocation.name } : image
    }).filter((img) => {
      if (activeTab !== 'All') {
        const matchedById = selectedLocation?.id != null
          && img.locationId != null
          && String(img.locationId) === String(selectedLocation.id)
        if (!matchedById && img.location !== activeTab) return false
      }
      if (activeLocationsOnly && !activeLocationIds.has(String(img.locationId))) return false
      if (activeOnly && !img.active) return false
      return true
    }).sort((a, b) => a.order - b.order)
  }, [images, locations, activeTab, activeLocationsOnly, activeOnly, selectedLocation])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, activeLocationsOnly, activeOnly])

  const itemsPerPage = 21
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const pageStart = (currentPage - 1) * itemsPerPage
  const pageEnd = Math.min(filtered.length, pageStart + itemsPerPage)
  const currentPageImages = filtered.slice(pageStart, pageEnd)

  const openCreate = () => setUploadModal({
    open: true,
    mode: 'create',
    initial: selectedLocation ? { locationId: selectedLocation.id } : null,
  })
  const openEdit = (img) => setUploadModal({ open: true, mode: 'edit', initial: img })

  const openEditLocation = async (location) => {
    if (loadingLocationId != null) return
    setLoadingLocationId(location.id)
    try {
      const details = await fetchLocationById(location.id)
      setLocationModal({ open: true, mode: 'edit', initial: details })
    } catch (error) {
      toast.error(error.message || 'Unable to load location details.')
    } finally {
      setLoadingLocationId(null)
    }
  }

  const handleSaveLocation = async (form) => {
    try {
      const editing = locationModal.mode === 'edit'
      const saved = editing
        ? await updateLocation(locationModal.initial.id, form)
        : await createLocation(form)
      if (!saved) throw new Error('The location was saved but no details were returned.')
      setLocations(await fetchLocations({ userId, activeOnly: false }))
      if (activeTab === locationModal.initial?.name || !editing) setActiveTab(saved.name)
      toast.success(`"${saved.name}" was ${editing ? 'updated' : 'created'}.`, {
        title: editing ? 'Location updated' : 'Location created',
      })
    } catch (error) {
      toast.error(error.message || 'Unable to save location.')
      return false
    }
  }

  const confirmDeleteLocation = async () => {
    if (!locationDeleteTarget || deletingLocation) return
    setDeletingLocation(true)
    try {
      await deleteLocation(locationDeleteTarget.id)
      setLocations((current) => current.filter((location) => String(location.id) !== String(locationDeleteTarget.id)))
      if (activeTab === locationDeleteTarget.name) setActiveTab('All')
      toast.success(`"${locationDeleteTarget.name}" was deleted.`, { title: 'Location deleted' })
      setLocationDeleteTarget(null)
    } catch (error) {
      toast.error(error.message || 'Unable to delete location.')
    } finally {
      setDeletingLocation(false)
    }
  }

  const handleSubmit = async (formData) => {
    if (submitRef.current) return
    submitRef.current = true
    try {
      if (uploadModal.mode === 'create') {
        const response = await createImage(formData, locations)
        if (!response) throw new Error('Upload failed')
        setImages((current) => [response, ...current.filter((item) => item.id !== response.id)])
        try {
          const refreshed = await fetchImages({ locationOptions: locations, userId })
          setImages(refreshed.map((item) => {
            if (String(item.id) !== String(response.id)) return item
            const locationId = item.locationId ?? response.locationId ?? formData.location
            const matchedLocation = locations.find((location) => String(location.id) === String(locationId))
            return {
              ...item,
              locationId,
              location: matchedLocation?.name || item.location,
            }
          }))
          setImageError('')
        } catch (refreshError) {
          setImageError(refreshError.message || 'The image uploaded, but the gallery could not refresh.')
        }
        toast.success(`Image added to ${response.location}.`, { title: 'Image uploaded' })
      } else {
        const response = await updateImage(uploadModal.initial.id, formData, locations)
        if (!response) throw new Error('Update failed')
        const updatedImage = { ...response, active: formData.active }
        rememberInactiveImage(updatedImage, userId)
        setImages((prev) => prev.map((image) => (image.id === response.id ? updatedImage : image)))
        toast.success('Image details updated.', { title: 'Changes saved' })
      }
      setUploadModal({ open: false, mode: 'create', initial: null })
      return true
    } catch (error) {
      toast.error(error.message || 'Unable to save image. Please try again.')
      return false
    } finally {
      submitRef.current = false
    }
  }

  const toggleActive = async (img) => {
    try {
      const nextActive = !img.active
      const response = await updateImage(img.id, {
        ...img,
        active: nextActive,
      })
      if (!response) throw new Error('Unable to update image status')
      const updatedImage = { ...img, ...response, active: nextActive }
      rememberInactiveImage(updatedImage, userId)
      setImages((prev) => prev.map((image) => (image.id === img.id ? updatedImage : image)))
      if (!nextActive) setActiveOnly(false)
      toast.info(`"${response.title || img.title || 'Untitled'}" is now ${nextActive ? 'active' : 'inactive'}.`)
    } catch (error) {
      toast.error(error.message || 'Unable to change image status.')
    }
  }

  const confirmDelete = async () => {
    try {
      const success = await deleteImage(deleteTarget.id, userId)
      if (!success) throw new Error('Delete failed')
      setImages((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.title || 'Untitled'}" was deleted.`)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error.message || 'Unable to delete image.')
    }
  }

  const tabCount = (tab) => {
    if (tab === 'All') {
      if (!activeLocationsOnly) return images.length
      const activeLocationIds = new Set(visibleLocations.map((location) => String(location.id)))
      return images.filter((image) => activeLocationIds.has(String(image.locationId))).length
    }
    const location = locations.find((item) => item.name === tab)
    return location?.id == null ? 0 : counts[String(location.id)] || 0
  }

  return (
    <div className="space-y-6">
      {locationError && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {locationError}
        </p>
      )}
      {imageError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {imageError}
        </p>
      )}
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Images</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{images.length} images across {locations.length} locations</p>
        </div>
        {allowCreate && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setLocationModal({ open: true, mode: 'create', initial: null })}>
              <Plus className="h-4 w-4" /> Add Location
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Upload Image
            </Button>
          </div>
        )}
      </div>

      {/* Filter tabs + active toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['All', ...visibleLocations.map((location) => location.name)].map((tab) => {
            const location = locations.find((item) => item.name === tab)
            const active = activeTab === tab
            return (
              <div
                key={tab}
                className={cn(
                  'inline-flex items-center overflow-hidden rounded-xl transition-all duration-200',
                  active
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
                )}
              >
                <button
                  onClick={() => setActiveTab(tab)}
                  className="inline-flex items-center gap-2 py-2 pl-3.5 pr-2 text-sm font-medium hover:opacity-80"
                >
                  {tab}
                  <span className={cn(
                    'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-semibold',
                    active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500',
                  )}>
                    {tabCount(tab)}
                  </span>
                </button>
                {location?.id && (
                  <>
                    <button
                      type="button"
                      title={`Edit ${location.name}`}
                      aria-label={`Edit ${location.name}`}
                      disabled={loadingLocationId != null || deletingLocation}
                      onClick={() => openEditLocation(location)}
                      className="grid h-9 w-9 place-items-center opacity-70 transition-opacity hover:opacity-100 disabled:cursor-wait"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title={`Delete ${location.name}`}
                      aria-label={`Delete ${location.name}`}
                      disabled={loadingLocationId != null || deletingLocation}
                      onClick={() => setLocationDeleteTarget(location)}
                      className="grid h-9 w-9 place-items-center text-slate-400 opacity-70 transition-colors hover:text-red-600 hover:opacity-100 disabled:cursor-wait"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700">
            <Toggle checked={activeLocationsOnly} onChange={setActiveLocationsOnly} />
            Active Locations only
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700">
            <Toggle checked={activeOnly} onChange={setActiveOnly} />
            Active Images only
          </label>
        </div>
      </div>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            Loading images...
          </div>
        ) : (
        <EmptyState
          icon={ImageIcon}
          title={activeOnly ? 'No active images here' : 'No images yet'}
          description={
            !allowCreate
              ? 'No images have been added to this location yet.'
              : activeOnly
              ? `There are no active images in ${activeTab === 'All' ? 'any location' : activeTab}. Toggle the filter off or upload a new image.`
              : `Upload your first image to ${activeTab === 'All' ? 'get started' : activeTab}.`
          }
          action={allowCreate && <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Upload Image</Button>}
        />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {currentPageImages.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ImageCard
                    image={img}
                    onEdit={() => openEdit(img)}
                    onToggle={() => toggleActive(img)}
                    onDelete={() => setDeleteTarget(img)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing <span className="font-semibold text-slate-900 dark:text-white">{pageStart + 1}</span>
                {' '}to <span className="font-semibold text-slate-900 dark:text-white">{pageEnd}</span>
                {' '}of <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> images
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="min-w-[80px] text-center text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload / Edit modal */}
      <UploadImageModal
        open={uploadModal.open}
        mode={uploadModal.mode}
        initial={uploadModal.initial}
        locations={locations}
        onClose={() => setUploadModal({ open: false, mode: 'create', initial: null })}
        onSubmit={handleSubmit}
      />

      <LocationFormModal
        open={locationModal.open}
        mode={locationModal.mode}
        initial={locationModal.initial}
        onClose={() => setLocationModal({ open: false, mode: 'create', initial: null })}
        onSubmit={handleSaveLocation}
      />

      <Modal
        open={!!locationDeleteTarget}
        onClose={() => !deletingLocation && setLocationDeleteTarget(null)}
        title="Delete location"
        description={`Delete "${locationDeleteTarget?.name || 'this location'}"? This action may be blocked if images are still assigned to it.`}
        size="sm"
        footer={(
          <>
            <Button variant="ghost" disabled={deletingLocation} onClick={() => setLocationDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deletingLocation} onClick={confirmDeleteLocation}>
              <Trash2 className="h-4 w-4" /> Delete location
            </Button>
          </>
        )}
      />

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete image"
        description="This will permanently remove this image from your site."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-800">
            You are about to delete <span className="font-semibold">{deleteTarget?.title || 'this image'}</span>.
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}

ImageCard.propTypes = {
  image: PropTypes.shape({
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
    order: PropTypes.number,
    active: PropTypes.bool,
    location: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

ImageGallery.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  allowCreate: PropTypes.bool,
}

function ImageCard({ image, onEdit, onToggle, onDelete }) {
  return (
    <Card className="group overflow-hidden transition-shadow duration-200 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image.url}
          alt={image.title || 'Site image'}
          loading="lazy"
          decoding="async"
          fetchPriority={image.order <= 3 ? 'high' : 'low'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* drag handle */}
        <div className="absolute left-2 top-2 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-white/90 text-slate-500 opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100" title="Drag to reorder">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* hover actions */}
        <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <ActionBtn label="Edit" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></ActionBtn>
          <ActionBtn label={image.active ? 'Deactivate' : 'Activate'} onClick={onToggle}>
            {image.active ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
          </ActionBtn>
          <ActionBtn label="Delete" danger onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></ActionBtn>
        </div>

        {/* sort order chip */}
        <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
          #{image.order}
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{image.title || 'Untitled'}</p>
        <div className="mt-2 flex items-center justify-between">
          <Badge tone="blue" size="sm">{image.location}</Badge>
          <Badge tone={image.active ? 'green' : 'neutral'} size="sm" dot>
            {image.active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
    </Card>
  )
}

ActionBtn.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string.isRequired,
  danger: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}

function ActionBtn({ children, label, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-white',
        danger && 'hover:text-red-600',
      )}
    >
      {children}
    </button>
  )
}

Toggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2',
        checked ? 'bg-amber-600' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
