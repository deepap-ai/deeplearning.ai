import CareerTrajectoryMap from '../components/CareerTrajectoryMap';

// Fill the entire main panel (break out of px-8 py-6 padding, fill height)
export default function ExploreDashboard() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <CareerTrajectoryMap />
        </div>
    );
}
