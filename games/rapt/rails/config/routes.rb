Rapt::Application.routes.draw do
  devise_for :users, :controllers => { :registrations => 'registrations' }

  # these have to be edit, not users, because the users namespace is taken up by devise (/users/sign_in, /users/sign_out, /users/sign_up, etc...)
  match 'edit' => 'users#show'
  match 'edit/:levelname' => 'users#edit_level', :via => :get
  match 'edit/:levelname' => 'users#update_level', :via => :put

  match 'data/:username' => 'users#menu_data', :username => /[^\/]+/
  match 'data/:username/:levelname' => 'users#level_data', :via => :get, :username => /[^\/]+/

  match 'stats' => 'users#get_stats', :via => :get
  match 'stats' => 'users#set_stats', :via => :put

  # resources :users do
  #   resources :levels
  # end

  resources :levels
  
  match 'play' => 'game#play'
  
  match '/manifest.:format' => "application#manifest"
  
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => "application#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
