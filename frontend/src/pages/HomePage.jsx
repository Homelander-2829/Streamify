import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitalize } from "../lib/utils.js"; // Fixed typo

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();

  // Updated queries with better error handling and data validation
  const { data: friendsData, isLoading: loadingFriends, error: friendsError } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: usersData, isLoading: loadingUsers, error: usersError } = useQuery({
    queryKey: ["users"], 
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs, error: outgoingError } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  // Safely extract arrays from API responses
  const friends = useMemo(() => {
    if (!friendsData) return [];
    // Handle different API response formats
    if (Array.isArray(friendsData)) return friendsData;
    if (friendsData.data && Array.isArray(friendsData.data)) return friendsData.data;
    if (friendsData.friends && Array.isArray(friendsData.friends)) return friendsData.friends;
    console.warn('Friends data is not in expected format:', friendsData);
    return [];
  }, [friendsData]);

  const recommendedUsers = useMemo(() => {
    if (!usersData) return [];
    // Handle different API response formats
    if (Array.isArray(usersData)) return usersData;
    if (usersData.data && Array.isArray(usersData.data)) return usersData.data;
    if (usersData.users && Array.isArray(usersData.users)) return usersData.users;
    if (usersData.recommendedUsers && Array.isArray(usersData.recommendedUsers)) return usersData.recommendedUsers;
    console.warn('Recommended users data is not in expected format:', usersData);
    return [];
  }, [usersData]);

  // Derive outgoing request IDs from the outgoing requests
  const outgoingRequestsIds = useMemo(() => {
    if (!outgoingFriendReqs || !Array.isArray(outgoingFriendReqs)) return new Set();
    return new Set(outgoingFriendReqs.map(req => req.recipient?._id).filter(Boolean));
  }, [outgoingFriendReqs]);

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  // Debug logging
  useEffect(() => {
    console.log('API Response Debug:');
    console.log('friendsData:', friendsData);
    console.log('usersData:', usersData);
    console.log('outgoingFriendReqs:', outgoingFriendReqs);
    console.log('Processed friends:', friends);
    console.log('Processed recommendedUsers:', recommendedUsers);
  }, [friendsData, usersData, outgoingFriendReqs, friends, recommendedUsers]);

  // Handle errors
  if (friendsError || usersError || outgoingError) {
    console.error('API Errors:', { friendsError, usersError, outgoingError });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Friends Section */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friendsError ? (
          <div className="card bg-error text-error-content p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">Error Loading Friends</h3>
            <p>Please try refreshing the page</p>
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends
              .filter(friend => friend && friend._id) // Filter out invalid friends
              .map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
          </div>
        )}

        {/* Recommended Users Section */}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : usersError ? (
            <div className="card bg-error text-error-content p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">Error Loading Recommendations</h3>
              <p>Please try refreshing the page</p>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers
                .filter(user => user && user._id) // Filter out invalid users
                .map((user) => {
                  const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                  return (
                    <div
                      key={user._id}
                      className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="card-body p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar size-16 rounded-full">
                            <img 
                              src={user.profilePic || '/default-avatar.png'} 
                              alt={user.fullName || 'User'} 
                              onError={(e) => {
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                          </div>

                          <div>
                            <h3 className="font-semibold text-lg">{user.fullName || 'Unknown User'}</h3>
                            {user.location && (
                              <div className="flex items-center text-xs opacity-70 mt-1">
                                <MapPinIcon className="size-3 mr-1" />
                                {user.location}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Languages with flags */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="badge badge-secondary">
                            {getLanguageFlag(user.nativeLanguage)}
                            Native: {capitalize(user.nativeLanguage) || 'Unknown'}
                          </span>
                          <span className="badge badge-outline">
                            {getLanguageFlag(user.learningLanguage)}
                            Learning: {capitalize(user.learningLanguage) || 'Unknown'}
                          </span>
                        </div>

                        {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                        {/* Action button */}
                        <button
                          className={`btn w-full mt-2 ${
                            hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          } `}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || isPending}
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <CheckCircleIcon className="size-4 mr-2" />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <UserPlusIcon className="size-4 mr-2" />
                              Send Friend Request
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;